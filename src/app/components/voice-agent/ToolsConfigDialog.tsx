/**
 * ToolsConfigDialog Component
 *
 * Dialog for configuring which tools are available to the voice agent.
 * Displays checkboxes for default and custom tools with descriptions.
 *
 * Per plan requirements:
 * - Separate dialog from audio settings
 * - Checkboxes for each tool (web search, code interpreter, image generation, current time, weather)
 * - Tool descriptions and use cases
 * - Disable editing while connected (require disconnection)
 * - Warning message when connected
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Info, Wrench, FolderOpen, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type ToolsConfig } from "@/lib/tools";
import {
  selectFolder,
  indexFolder,
  isIndexed,
  getIndexStats,
  isFileSystemAccessSupported,
  clearIndex,
} from "@/lib/rag";

interface ToolsConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ToolsConfig;
  onConfigChange: (config: ToolsConfig) => void;
  isConnected: boolean;
}

interface ToolDefinition {
  id: keyof ToolsConfig;
  category: "default" | "custom";
  available: boolean;
}

export function ToolsConfigDialog({
  open,
  onOpenChange,
  config,
  onConfigChange,
  isConnected,
}: ToolsConfigDialogProps) {
  const { t } = useTranslation();
  const [tempConfig, setTempConfig] = useState<ToolsConfig>(config);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexStats, setIndexStats] = useState<{
    chunkCount: number;
    fileCount: number;
    indexedAt: Date | null;
  } | null>(null);

  // Sync temp config with props when dialog opens
  useEffect(() => {
    if (open) {
      setTempConfig(config);
      // Update index stats when dialog opens
      const stats = getIndexStats();
      setIndexStats(stats);
    }
  }, [open, config]);

  // Handle folder selection and indexing
  const handleSelectFolder = async () => {
    if (!isFileSystemAccessSupported()) {
      alert(
        t("tools.rag.browserNotSupported") ||
          "File System Access API is not supported in this browser. Please use Chrome, Edge, or Safari 15.2+."
      );
      return;
    }

    try {
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
        console.log("[ToolsConfigDialog] Folder indexed:", result);
      }
    } catch (error) {
      console.error("[ToolsConfigDialog] Error indexing folder:", error);
      alert(
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
    }
  };

  // Tool definitions with availability status
  const tools: ToolDefinition[] = [
    {
      id: "web_search",
      category: "default",
      available: false, // Not yet available in Realtime API
    },
    {
      id: "code_interpreter",
      category: "default",
      available: false, // Not yet available in Realtime API
    },
    {
      id: "image_generation",
      category: "default",
      available: false, // Not yet available in Realtime API
    },
    {
      id: "current_time",
      category: "custom",
      available: true,
    },
    {
      id: "weather",
      category: "custom",
      available: true,
    },
    {
      id: "rag",
      category: "custom",
      available: true,
    },
  ];

  const handleToolToggle = (toolId: keyof ToolsConfig, enabled: boolean) => {
    setTempConfig((prev) => ({
      ...prev,
      [toolId]: enabled,
    }));
  };

  const handleSave = () => {
    onConfigChange(tempConfig);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    onOpenChange(false);
  };

  const enabledCount = Object.values(tempConfig).filter(Boolean).length;

  // Get tool icon
  const getToolIcon = (toolId: keyof ToolsConfig): string => {
    const icons: Record<keyof ToolsConfig, string> = {
      web_search: "🔍",
      code_interpreter: "💻",
      image_generation: "🎨",
      current_time: "⏰",
      weather: "🌤️",
      rag: "📚",
    };
    return icons[toolId];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              {t("tools.title")}
            </DialogTitle>
            <Badge variant="secondary">
              {t("tools.enabledCount", { count: enabledCount })}
            </Badge>
          </div>
          <DialogDescription>{t("tools.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection warning */}
          {isConnected && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {t("tools.disconnectWarning")}
              </AlertDescription>
            </Alert>
          )}

          {/* Default Tools Section */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("tools.defaultTools")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tools
                .filter((tool) => tool.category === "default")
                .map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Checkbox
                      id={tool.id}
                      checked={tempConfig[tool.id]}
                      onCheckedChange={(checked) =>
                        handleToolToggle(tool.id, checked as boolean)
                      }
                      disabled={isConnected || !tool.available}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={tool.id}
                        className={`text-sm font-medium leading-none ${
                          isConnected || !tool.available
                            ? "text-muted-foreground cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span className="mr-2">{getToolIcon(tool.id)}</span>
                        {t(`tools.${tool.id}.name`)}
                        {!tool.available && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900"
                          >
                            {t("tools.comingSoon")}
                          </Badge>
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {t(`tools.${tool.id}.description`)}
                      </p>
                      {!tool.available && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          {t("tools.notAvailableInRealtimeApi")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Custom Tools Section */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("tools.customTools")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tools
                .filter((tool) => tool.category === "custom")
                .map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Checkbox
                      id={tool.id}
                      checked={tempConfig[tool.id]}
                      onCheckedChange={(checked) =>
                        handleToolToggle(tool.id, checked as boolean)
                      }
                      disabled={isConnected}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <label
                        htmlFor={tool.id}
                        className={`text-sm font-medium leading-none ${
                          isConnected
                            ? "text-muted-foreground cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span className="mr-2">{getToolIcon(tool.id)}</span>
                        {t(`tools.${tool.id}.name`)}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {t(`tools.${tool.id}.description`)}
                      </p>
                      {/* RAG-specific folder selection UI */}
                      {tool.id === "rag" && (
                        <div className="mt-2 space-y-2">
                          {indexStats ? (
                            <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <div className="text-xs">
                                  <p className="font-medium text-green-900 dark:text-green-100">
                                    {t("tools.rag.indexed") ||
                                      "Folder indexed"}
                                  </p>
                                  <p className="text-green-700 dark:text-green-300">
                                    {t("tools.rag.stats", {
                                      files: indexStats.fileCount,
                                      chunks: indexStats.chunkCount,
                                    }) ||
                                      `${indexStats.fileCount} files, ${indexStats.chunkCount} chunks`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearIndex}
                                disabled={isIndexing}
                                className="h-7 text-xs"
                              >
                                {t("tools.rag.clear") || "Clear"}
                              </Button>
                            </div>
                          ) : (
                            <div className="p-2 rounded bg-muted border">
                              <p className="text-xs text-muted-foreground mb-2">
                                {t("tools.rag.noFolderSelected") ||
                                  "No folder selected. Select a folder to enable document search."}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSelectFolder}
                                disabled={isIndexing}
                                className="w-full"
                              >
                                {isIndexing ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    {t("tools.rag.indexing") || "Indexing..."}
                                  </>
                                ) : (
                                  <>
                                    <FolderOpen className="h-3 w-3 mr-2" />
                                    {t("tools.rag.selectFolder") ||
                                      "Select Folder"}
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {t("tools.info")}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isConnected}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

