/**
 * RAG Folder Selector Component
 *
 * Displays RAG tool folder selection UI on the main screen.
 * Allows users to select and index folders for document search.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FolderOpen,
  Loader2,
  CheckCircle2,
  X,
  Info,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  selectFolder,
  indexFolder,
  getIndexStats,
  isFileSystemAccessSupported,
  clearIndex,
} from "@/lib/rag";
import { type ToolsConfig } from "@/lib/tools";

interface RagFolderSelectorProps {
  toolsConfig: ToolsConfig;
}

export function RagFolderSelector({ toolsConfig }: RagFolderSelectorProps) {
  const { t } = useTranslation();
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStats, setIndexStats] = useState<{
    chunkCount: number;
    fileCount: number;
    indexedAt: Date | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update index stats on mount and when toolsConfig changes
  useEffect(() => {
    const stats = getIndexStats();
    setIndexStats(stats);
  }, [toolsConfig.rag]);

  // Handle folder selection and indexing
  const handleSelectFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      setError(
        t("tools.rag.browserNotSupported") ||
          "File System Access API is not supported in this browser. Please use Chrome, Edge, or Safari 15.2+."
      );
      return;
    }

    try {
      setError(null);
      setIsIndexing(true);
      const folderHandle = await selectFolder();
      if (!folderHandle) {
        // User cancelled
        setIsIndexing(false);
        return;
      }

      // Index the folder
      const result = await indexFolder(folderHandle);
      const stats = getIndexStats();
      setIndexStats(stats);

      if (process.env.NODE_ENV === "development") {
        console.log("[RagFolderSelector] Folder indexed:", result);
      }
    } catch (error) {
      console.error("[RagFolderSelector] Error indexing folder:", error);
      setError(
        error instanceof Error
          ? error.message
          : t("tools.rag.indexingError") || "Failed to index folder"
      );
    } finally {
      setIsIndexing(false);
    }
  };

  // Handle clear index
  const handleClearIndex = () => {
    if (
      confirm(
        t("tools.rag.clearConfirm") ||
          "Are you sure you want to clear the indexed folder?"
      )
    ) {
      clearIndex();
      setIndexStats(null);
      setError(null);
    }
  };

  // Don't show if RAG tool is disabled
  if (!toolsConfig.rag) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {t("tools.rag.name")}
          </CardTitle>
          {indexStats && (
            <Badge variant="secondary" className="text-xs">
              {t("tools.rag.stats", {
                files: indexStats.fileCount,
                chunks: indexStats.chunkCount,
              }) ||
                `${indexStats.fileCount} files, ${indexStats.chunkCount} chunks`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="absolute top-2 right-2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {indexStats ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  {t("tools.rag.indexed") || "Folder indexed"}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {t("tools.rag.stats", {
                    files: indexStats.fileCount,
                    chunks: indexStats.chunkCount,
                  }) ||
                    `${indexStats.fileCount} files, ${indexStats.chunkCount} chunks`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectFolder}
                disabled={isIndexing}
                className="gap-2"
              >
                {isIndexing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("tools.rag.indexing") || "Indexing..."}
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-3 w-3" />
                    {t("tools.rag.changeFolder") || "Change Folder"}
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearIndex}
                disabled={isIndexing}
                className="gap-2"
              >
                {t("tools.rag.clear") || "Clear"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("tools.rag.noFolderSelected") ||
                "No folder selected. Select a folder to enable document search."}
            </p>
            <Button
              variant="default"
              size="sm"
              onClick={handleSelectFolder}
              disabled={isIndexing}
              className="w-full gap-2"
            >
              {isIndexing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("tools.rag.indexing") || "Indexing..."}
                </>
              ) : (
                <>
                  <FolderOpen className="h-4 w-4" />
                  {t("tools.rag.selectFolder") || "Select Folder"}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

