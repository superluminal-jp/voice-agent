/**
 * ConversationHistory Component
 *
 * Displays conversation history with messages.
 */

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Trash2, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getItemText } from "@/lib/realtime-api";
import type { RealtimeItem } from "@openai/agents/realtime";
import {
  isRealtimeMessageItem,
  isUserMessage,
  isAssistantMessage,
  isAnyToolCall,
  getToolCallName,
  getToolCallArguments,
  getToolCallOutput,
  getToolCallStatus,
} from "@/types/realtime-session";
import { getToolIcon, getToolDisplayName } from "@/lib/tools";
import type { ToolLanguage } from "@/lib/tools";

interface ConversationHistoryProps {
  history: RealtimeItem[];
  isConnected: boolean;
  onClearHistory: () => void;
  onViewSessions?: () => void;
}

/**
 * ToolCallDisplay Sub-component
 *
 * Displays tool/function call information with arguments, output, and status.
 * Per plan: Show tool name with icon, arguments (formatted JSON), results/output, and status.
 */
interface ToolCallDisplayProps {
  item: RealtimeItem;
  language: ToolLanguage;
}

function ToolCallDisplay({ item, language }: ToolCallDisplayProps) {
  const { t } = useTranslation();

  const toolName = getToolCallName(item);
  const toolArguments = getToolCallArguments(item);
  const toolOutput = getToolCallOutput(item);
  const toolStatus = getToolCallStatus(item);

  if (!toolName) {
    return null;
  }

  const displayName = getToolDisplayName(toolName, language);
  const icon = getToolIcon(toolName);

  // Format arguments as pretty JSON
  let formattedArguments = "";
  try {
    if (toolArguments) {
      const parsed = JSON.parse(toolArguments);
      formattedArguments = JSON.stringify(parsed, null, 2);
    }
  } catch (error) {
    formattedArguments = toolArguments || "";
  }

  // Status badge color
  const statusColor =
    toolStatus === "completed"
      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      : toolStatus === "in_progress"
      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
      : toolStatus === "incomplete"
      ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";

  return (
    <div className="space-y-2 p-3 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
      {/* Tool name and status */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-semibold text-foreground">
          {displayName}
        </span>
        {toolStatus && (
          <Badge className={`text-xs ${statusColor}`}>
            {t(`tools.toolCall.status.${toolStatus}`)}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">
          {t("tools.toolCall.title")}
        </Badge>
      </div>

      {/* Arguments */}
      {formattedArguments && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            {t("tools.toolCall.arguments")}:
          </div>
          <pre className="text-xs bg-muted/50 p-2 rounded border overflow-x-auto">
            <code>{formattedArguments}</code>
          </pre>
        </div>
      )}

      {/* Output */}
      {toolOutput && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">
            {t("tools.toolCall.output")}:
          </div>
          <div className="text-sm bg-muted/30 p-2 rounded border">
            <p className="whitespace-pre-wrap leading-relaxed">{toolOutput}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ConversationHistory({
  history,
  isConnected,
  onClearHistory,
  onViewSessions,
}: ConversationHistoryProps) {
  const { t, i18n } = useTranslation();
  const [showHistory, setShowHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Determine current language for tool display
  const language = (i18n.language.startsWith("ja")
    ? "ja"
    : "en") as ToolLanguage;

  // Auto-show history when connected
  useEffect(() => {
    if (isConnected) {
      setShowHistory(true);
    }
  }, [isConnected]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (showHistory && history.length > 0) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector(
            "[data-radix-scroll-area-viewport]"
          );
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100);
    }
  }, [history, showHistory]);

  if (!isConnected) {
    return null;
  }

  const clearHistory = () => {
    onClearHistory();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t("conversation.title")}
            </CardTitle>
            {history.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {t("conversation.messageCount", { count: history.length })}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory
                ? t("conversation.hideHistory")
                : t("conversation.showHistory")}
            </Button>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {t("conversation.clearHistory")}
              </Button>
            )}
          </div>
        </div>
        {history.length === 0 && (
          <CardDescription>{t("conversation.description")}</CardDescription>
        )}
      </CardHeader>
      {showHistory && (
        <CardContent>
          <ScrollArea
            ref={scrollAreaRef}
            className="h-96 w-full border rounded-md"
          >
            <div className="p-4 space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-medium text-foreground mb-1">
                    {t("conversation.empty")}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {t("conversation.emptyDescription")}
                  </p>
                </div>
              ) : (
                history
                  .map((item, index) => {
                    // Check if this is a tool call
                    const isToolCall = isAnyToolCall(item);

                    // For tool calls, always show them
                    if (isToolCall) {
                      return {
                        item,
                        index,
                        itemText: "",
                        isEmpty: false,
                        isToolCall: true,
                      };
                    }

                    const itemText = getItemText(item);
                    const isEmpty = !itemText || itemText.trim().length === 0;

                    // Check if this is a message in progress (temporary state)
                    // Per OpenAI API: use type guard to safely access status property
                    const isInProgress =
                      isRealtimeMessageItem(item) &&
                      "status" in item &&
                      (item.status === "in_progress" ||
                        item.status === "incomplete");

                    // Log for debugging (only in development)
                    // Skip warnings for in-progress messages as they're temporary states
                    if (
                      process.env.NODE_ENV === "development" &&
                      !isInProgress
                    ) {
                      if (isEmpty) {
                        // Only warn if this is a completed message without text
                        // Check if there's actual content that should have been extracted
                        const hasContent =
                          isRealtimeMessageItem(item) &&
                          item.content &&
                          ((Array.isArray(item.content) &&
                            item.content.length > 0) ||
                            (typeof item.content === "string" &&
                              (item.content as string).trim().length > 0));

                        if (hasContent && isRealtimeMessageItem(item)) {
                          // Log detailed content structure for debugging
                          const detailedContent = item.content
                            ? Array.isArray(item.content)
                              ? item.content.map((c: any, i: number) => ({
                                  index: i,
                                  type: typeof c,
                                  keys:
                                    typeof c === "object" && c !== null
                                      ? Object.keys(c)
                                      : [],
                                  value: c,
                                  // Include all properties for debugging
                                  ...(typeof c === "object" && c !== null
                                    ? c
                                    : {}),
                                }))
                              : typeof item.content === "string"
                              ? {
                                  type: typeof item.content,
                                  value: item.content,
                                }
                              : null
                            : null;
                        }
                      }
                    }

                    return {
                      item,
                      index,
                      itemText,
                      isEmpty,
                      isToolCall: false,
                    };
                  })
                  .filter(({ isEmpty }) => !isEmpty)
                  .map(({ item, index, itemText, isToolCall }) => (
                    <div key={index} className="space-y-1">
                      {isToolCall ? (
                        // Render tool call with special display
                        <ToolCallDisplay item={item} language={language} />
                      ) : (
                        // Render normal message
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {isUserMessage(item)
                                ? t("common.you")
                                : isAssistantMessage(item)
                                ? t("common.assistant")
                                : item.type}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            {isRealtimeMessageItem(item) && item.role && (
                              <Badge variant="secondary" className="text-xs">
                                {item.role}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-foreground">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {itemText}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}
