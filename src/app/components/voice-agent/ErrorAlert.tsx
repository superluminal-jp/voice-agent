/**
 * ErrorAlert Component
 * 
 * Displays error messages with recovery actions.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  error: string;
  onDismiss: () => void;
  onRetrySystemAudio?: () => void;
  onRefreshDevices?: () => void;
}

export function ErrorAlert({
  error,
  onDismiss,
  onRetrySystemAudio,
  onRefreshDevices,
}: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="border-destructive/50">
      <AlertDescription className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
              <span className="text-destructive text-xs font-bold">!</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <p className="font-medium">Error occurred</p>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {error}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-destructive/20">
          {error.includes("system audio") && onRetrySystemAudio && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetrySystemAudio}
              className="gap-2 border-destructive/50 hover:bg-destructive/10"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {(error.includes("microphone") ||
            error.includes("permission") ||
            error.includes("device")) &&
            onRefreshDevices && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefreshDevices}
                className="gap-2 border-destructive/50 hover:bg-destructive/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Devices
              </Button>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

