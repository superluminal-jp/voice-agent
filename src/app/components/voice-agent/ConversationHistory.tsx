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
import { MessageSquare, Trash2, User, Bot, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getItemText } from "@/lib/realtime-api";
import type { RealtimeItem } from "@openai/agents/realtime";

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
            {onViewSessions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewSessions}
              >
                <History className="h-4 w-4 mr-1" />
                {t("conversation.viewSessions")}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? t("conversation.hideHistory") : t("conversation.showHistory")}
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
          <CardDescription>
            {t("conversation.description")}
          </CardDescription>
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
                <div className="text-center text-muted-foreground py-12">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="font-medium text-foreground mb-1">
                    {t("conversation.empty")}
                  </p>
                  <p className="text-sm">
                    {t("conversation.emptyDescription")}
                  </p>
                </div>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      {item.type === "message" && item.role === "user" ? (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      ) : item.type === "message" &&
                        item.role === "assistant" ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {item.type === "message" && item.role === "user"
                            ? t("common.you")
                            : item.type === "message" &&
                              item.role === "assistant"
                            ? t("common.assistant")
                            : item.type}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p className="whitespace-pre-wrap">
                          {getItemText(item)}
                        </p>
                      </div>
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

