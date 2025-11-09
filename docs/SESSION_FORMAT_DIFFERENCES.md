# セッション保存形式とupdateHistory形式の違い

## 概要

このドキュメントでは、localStorageに保存されるセッション履歴の形式と、`updateHistory()`に渡す履歴の形式の違いを説明します。

## データフロー

```
[APIから受信] → [history_updatedイベント] → [saveSession] → [localStorage保存]
                                                              ↓
[localStorage読み込み] → [getSession] → [validateHistory] → [updateHistory]
```

## 1. 保存時の処理（saveSession）

### 入力形式（history_updatedイベントから）
- **ソース**: OpenAI Realtime APIから返される`RealtimeItem[]`
- **特徴**:
  - 完全な形式（audioデータを含む可能性がある）
  - `itemId`フィールドを使用
  - `status`フィールドが含まれる（`in_progress`, `completed`, `incomplete`）
  - `output_audio`タイプのコンテンツに`audio`フィールドが含まれる可能性がある

### 処理内容（validateHistory内）
1. **検証**: 各アイテムの必須フィールドをチェック
2. **サニタイズ**:
   - `null`の`audio`フィールドを削除
   - タイプに応じて不要なフィールドを削除:
     - `output_audio`/`input_audio`: `text`フィールドを削除
     - `input_text`/`output_text`: `audio`/`transcript`フィールドを削除
3. **フィルタリング**:
   - `in_progress`や`incomplete`状態のメッセージを除外（一時的な状態で復元不可）
   - 空のコンテンツ配列を持つメッセージを除外

### 保存形式（localStorage）
- **形式**: JSON文字列として保存
- **特徴**:
  - 検証・サニタイズ済みの形式
  - `audio`データは通常含まれない（メモリ節約のため）
  - `transcript`フィールドは保持される
  - 型に応じたフィールドのみが含まれる
  - `in_progress`/`incomplete`状態のメッセージは含まれない（完了したメッセージのみ保存）
  - 空のコンテンツ配列を持つメッセージは含まれない

## 2. 読み込み時の処理（handleLoadSession）

### 入力形式（localStorageから）
- **ソース**: `getSession()`で読み込んだ`SavedSession`
- **特徴**:
  - JSONデシリアライズ済み
  - 既に`validateHistory()`で検証済み
  - `agentConfig`が含まれる（name, instructions）

### 処理内容
1. **再検証**: `getSession()`内で`validateHistory()`を再度呼び出し
2. **connect()に渡す**: `connect(session.history)`として渡す
3. **connect()内で再検証**: `validateHistory()`を再度呼び出し
4. **updateHistory()に渡す**: 検証済みの履歴を`session.updateHistory(validatedHistory)`に渡す

### updateHistoryに渡す形式
- **形式**: `RealtimeItem[]`
- **特徴**:
  - 検証・サニタイズ済み
  - タイプに応じたフィールドのみが含まれる
  - `output_audio`タイプには`text`フィールドが含まれない
  - `input_text`/`output_text`タイプには`audio`/`transcript`フィールドが含まれない
  - `in_progress`/`incomplete`状態のメッセージは含まれない（完了したメッセージのみ）
  - 空のコンテンツ配列を持つメッセージは含まれない

## 3. 主な違い

### フィールドの有無

| フィールド | 保存時（localStorage） | updateHistoryに渡す時 |
|-----------|---------------------|---------------------|
| `itemId` | ✅ 必須 | ✅ 必須 |
| `status` | ✅ 含まれる | ✅ 含まれる |
| `audio` (output_audio) | ❌ 通常含まれない | ❌ 含まれない（nullの場合は削除） |
| `transcript` (output_audio) | ✅ 含まれる | ✅ 含まれる |
| `text` (output_audio) | ❌ 含まれない | ❌ 含まれない（削除される） |
| `text` (input_text/output_text) | ✅ 必須 | ✅ 必須 |
| `audio`/`transcript` (input_text/output_text) | ❌ 含まれない | ❌ 含まれない（削除される） |

### サニタイゼーションの違い

#### 保存時
- `history_updated`イベントから受け取った履歴をそのまま`validateHistory()`で検証・サニタイズ
- APIから返された形式をそのまま処理

#### 読み込み時
- localStorageから読み込んだ履歴を`validateHistory()`で再検証・再サニタイズ
- JSONデシリアライズ後の形式を処理

## 4. 問題点と解決策

### 問題: `output_audio`に`text`フィールドが含まれる
- **原因**: 保存時に`text`フィールドが削除されていない
- **解決策**: サニタイゼーション処理で、タイプに応じて不要なフィールドを削除

### 問題: `null`の`audio`フィールドが含まれる
- **原因**: APIが`null`の`audio`フィールドを返すことがある
- **解決策**: サニタイゼーション処理で、`null`の`audio`フィールドを削除

### 問題: `in_progress`状態のメッセージが含まれる
- **原因**: `history_updated`イベント時に進行中のメッセージが保存される
- **症状**: 復元時に`Missing required parameter: 'item.content[0].text'`エラーが発生
- **解決策**: `validateHistory()`で`in_progress`/`incomplete`状態のメッセージを除外

### 問題: 空のコンテンツ配列を持つメッセージが含まれる
- **原因**: メッセージが生成される前に保存される
- **症状**: 復元時に`Missing required parameter: 'item.content[0].text'`エラーが発生
- **解決策**: `validateHistory()`で空のコンテンツ配列を持つメッセージを除外

## 5. 実装の整合性

現在の実装では、保存時と読み込み時の両方で同じ`validateHistory()`関数を使用しているため、形式は基本的に同じになります。しかし、以下の点に注意が必要です：

1. **二重検証**: 読み込み時に`validateHistory()`が複数回呼ばれる可能性がある
2. **パフォーマンス**: 不要な再検証を避けるため、既に検証済みの履歴には再検証をスキップする最適化が可能

## 6. 推奨事項

1. **保存時**: `validateHistory()`で検証・サニタイズしてから保存
2. **読み込み時**: 保存時に検証済みでも、念のため再検証を実施
3. **updateHistoryに渡す前**: 必ず`validateHistory()`で検証・サニタイズ

これにより、APIエラーを防ぎ、一貫性のある形式を保証できます。

