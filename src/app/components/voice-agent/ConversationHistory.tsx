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
} from "@/types/realtime-session";

interface ConversationHistoryProps {
  history: RealtimeItem[];
  isConnected: boolean;
  onClearHistory: () => void;
  onViewSessions?: () => void;
}

export function ConversationHistory({
  history,
  isConnected,
  onClearHistory,
  onViewSessions,
}: ConversationHistoryProps) {
  const { t } = useTranslation();
  const [showHistory, setShowHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
                    const itemText = getItemText(item);
                    const isEmpty = !itemText || itemText.trim().length === 0;

                    // Check if this is a message in progress (temporary state)
                    // Per OpenAI API: use type guard to safely access status property
                    const isInProgress =
                      isRealtimeMessageItem(item) &&
                      (item.status === "in_progress" ||
                        item.status === "incomplete" ||
                        item.status === "pending");

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
                          item.content &&
                          ((Array.isArray(item.content) &&
                            item.content.length > 0) ||
                            (typeof item.content === "string" &&
                              item.content.trim().length > 0));

                        if (hasContent) {
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
                              : {
                                  type: typeof item.content,
                                  value: item.content,
                                }
                            : null;
                        }
                      }
                    }

                    return {
                      item,
                      index,
                      itemText,
                      isEmpty,
                    };
                  })
                  .filter(({ isEmpty }) => !isEmpty)
                  .map(({ item, index, itemText }) => (
                    <div key={index} className="space-y-1">
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
