import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Mic,
  Settings,
  Monitor,
  MessageSquare,
  Volume2,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Users,
  FileText,
  Languages,
  Headphones,
} from "lucide-react";

export const metadata = {
  title: "チュートリアル - Voice Agent",
  description: "Voice Agent の使い方を学ぶ",
};

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-black dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header with utility buttons in top right */}
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              チュートリアル
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Voice Agent の使い方を学びましょう
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  ホームに戻る
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-black dark:text-white" />
              クイックスタート
            </CardTitle>
            <CardDescription>
              5分で始められる基本的な使い方
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">接続を開始</h3>
                  <p className="text-sm text-muted-foreground">
                    ホームページの「Connect」ボタンをクリックして、音声セッションを開始します。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">マイクの許可</h3>
                  <p className="text-sm text-muted-foreground">
                    ブラウザがマイクへのアクセスを要求したら、「許可」をクリックしてください。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">話しかける</h3>
                  <p className="text-sm text-muted-foreground">
                    AI に自然に話しかけてください。AI がリアルタイムで応答します。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">会話履歴を確認</h3>
                  <p className="text-sm text-muted-foreground">
                    会話履歴パネルで、これまでの会話を確認できます。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              主要機能
            </CardTitle>
            <CardDescription>
              Voice Agent の主要な機能を紹介します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">音声入力モード</h3>
                    <p className="text-sm text-muted-foreground">
                      Always On、Push-to-Talk、Toggle の3つのモードから選択できます。
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">システムオーディオキャプチャ</h3>
                    <p className="text-sm text-muted-foreground">
                      Zoom、Teams などのアプリの音声をキャプチャできます。
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">システムプロンプト</h3>
                    <p className="text-sm text-muted-foreground">
                      AI の動作や性格をカスタマイズできます。
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">オーディオデバイス選択</h3>
                    <p className="text-sm text-muted-foreground">
                      マイクとスピーカーを個別に選択できます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              使用例
            </CardTitle>
            <CardDescription>
              様々なシーンで活用できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">会議アシスタント</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Zoom や Teams の会議をリアルタイムで文字起こし・要約します。
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• システムオーディオキャプチャを有効化</p>
                      <p>• システムプロンプトを「会議要約」に設定</p>
                      <p>• 会話履歴で要点を確認</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">音声メモ・タスク管理</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      作業中にアイデアやタスクを音声で記録・整理します。
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Always On モードで自然に話しかける</p>
                      <p>• システムプロンプトを「タスク管理」に設定</p>
                      <p>• AI にタスクを整理・優先順位付けしてもらう</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">会議中のリアルタイムアシスタント</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      会議中に AI に質問・相談できます。
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Push-to-Talk モードを使用</p>
                      <p>• システムオーディオ + マイクをミキシング</p>
                      <p>• Space キーを押して話す</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">リアルタイム翻訳アシスタント</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      外国語の会話をリアルタイムで翻訳します。
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• システムプロンプトを「翻訳アシスタント」に設定</p>
                      <p>• 会話履歴で翻訳前後の対比を確認</p>
                      <p>• 言語選択を簡単に切り替え</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Audio Setup */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              システムオーディオ設定
            </CardTitle>
            <CardDescription>
              Zoom、Teams などのアプリの音声をキャプチャする方法
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">クイックセットアップ（ブラウザ画面共有）</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. 「Audio Settings」ボタンをクリック</p>
                  <p>2. 「System Audio Capture」セクションで「Start Capture」をクリック</p>
                  <p>3. 画面またはウィンドウを選択し、「Share system audio」にチェック</p>
                  <p>4. 「Share」をクリック</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  <strong>注意:</strong> この方法では、すべてのシステム音声がキャプチャされます。
                  特定のアプリのみをキャプチャしたい場合は、仮想オーディオケーブルを使用してください。
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">高度な設定（仮想オーディオケーブル）</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  より細かい制御が必要な場合は、仮想オーディオケーブルを使用します。
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Windows: VB-Audio Virtual Cable または VoiceMeeter</p>
                  <p>• macOS: BlackHole または Loopback</p>
                  <p>• Linux: PulseAudio の仮想デバイス</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted mt-4">
                <p className="text-sm">
                  <strong>詳細情報:</strong> プロジェクトの <code className="text-xs bg-background px-1 py-0.5 rounded">SYSTEM_AUDIO_SETUP.md</code> ファイルに、プラットフォーム別の詳細な設定手順が記載されています。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Modes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              音声入力モード
            </CardTitle>
            <CardDescription>
              3つのモードから選択できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Always On（常時有効）</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  マイクが常に有効で、話すと自動的に検出されます。
                </p>
                <div className="text-xs text-muted-foreground">
                  <p><strong>推奨:</strong> 静かな環境、音声メモ、タスク管理</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Push-to-Talk（PTT）</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Space キーを押している間だけマイクが有効になります。
                </p>
                <div className="text-xs text-muted-foreground">
                  <p><strong>推奨:</strong> ノイズ環境、会議中の使用</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Toggle（切り替え）</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Space キーでマイクのオン/オフを切り替えます。
                </p>
                <div className="text-xs text-muted-foreground">
                  <p><strong>推奨:</strong> 長時間の会話、ハンズフリー操作</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              トラブルシューティング
            </CardTitle>
            <CardDescription>
              よくある問題と解決方法
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">マイクが認識されない</h3>
                    <p className="text-sm text-muted-foreground">
                      • ブラウザのマイク権限を確認してください
                      <br />
                      • 「Audio Settings」で正しいマイクが選択されているか確認してください
                      <br />
                      • 他のアプリがマイクを使用していないか確認してください
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">システムオーディオがキャプチャできない</h3>
                    <p className="text-sm text-muted-foreground">
                      • Chrome または Edge を使用しているか確認してください（Firefox や Safari では対応していません）
                      <br />
                      • 画面共有時に「Share system audio」にチェックが入っているか確認してください
                      <br />
                      • 仮想オーディオケーブルを使用する場合は、正しく設定されているか確認してください
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">接続エラーが発生する</h3>
                    <p className="text-sm text-muted-foreground">
                      • インターネット接続を確認してください
                      <br />
                      • OpenAI API キーが正しく設定されているか確認してください
                      <br />
                      • ブラウザのコンソールでエラーメッセージを確認してください
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link href="/">
              アプリを開始する
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

