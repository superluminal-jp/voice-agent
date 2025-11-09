/**
 * TextInput Component
 *
 * Allows users to send text messages to the voice agent.
 */

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TextInputProps {
  isConnected: boolean;
  onSendMessage: (message: string) => Promise<void> | void;
  disabled?: boolean;
}

export function TextInput({
  isConnected,
  onSendMessage,
  disabled = false,
}: TextInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !isConnected || isSending || disabled) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(trimmedText);
      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
      // Keep the text if there's an error so user can retry
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInputDisabled = !isConnected || isSending || disabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("textInput.label")}</CardTitle>
        <CardDescription className="text-xs">
          {t("textInput.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isConnected
                  ? t("textInput.placeholder")
                  : t("textInput.placeholderDisabled")
              }
              disabled={isInputDisabled}
              className="min-h-[100px] resize-none"
              rows={3}
            />
          </div>
          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSend}
              disabled={isInputDisabled || !text.trim()}
              size="default"
              className="h-[100px] px-4"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {!isConnected && (
          <p className="text-xs text-muted-foreground mt-2">
            {t("textInput.connectToEnable")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

