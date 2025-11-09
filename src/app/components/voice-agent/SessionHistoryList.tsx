/**
 * SessionHistoryList Component
 * 
 * Displays a list of saved conversation sessions with options to load or delete them.
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  Trash2,
  Loader2,
  Clock,
  Calendar,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getAllSessions,
  deleteSession,
  deleteAllSessions,
  type SavedSession,
} from "@/lib/session-storage";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SessionHistoryListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadSession: (session: SavedSession) => void;
}

export function SessionHistoryList({
  open,
  onOpenChange,
  onLoadSession,
}: SessionHistoryListProps) {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Load sessions when dialog opens
  useEffect(() => {
    if (open) {
      loadSessions();
    }
  }, [open]);

  const loadSessions = () => {
    setIsLoading(true);
    try {
      const allSessions = getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSession = (session: SavedSession) => {
    onLoadSession(session);
    onOpenChange(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const success = deleteSession(sessionId);
      if (success) {
        loadSessions();
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      const success = deleteAllSessions();
      if (success) {
        setSessions([]);
        setShowDeleteAllConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting all sessions:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return `${t("sessionHistory.lastUpdated")}: Just now`;
    } else if (diffMins < 60) {
      return `${t("sessionHistory.lastUpdated")}: ${diffMins} ${
        diffMins === 1 ? "minute" : "minutes"
      } ago`;
    } else if (diffHours < 24) {
      return `${t("sessionHistory.lastUpdated")}: ${diffHours} ${
        diffHours === 1 ? "hour" : "hours"
      } ago`;
    } else if (diffDays < 7) {
      return `${t("sessionHistory.lastUpdated")}: ${diffDays} ${
        diffDays === 1 ? "day" : "days"
      } ago`;
    } else {
      // Format full date
      return `${t("sessionHistory.lastUpdated")}: ${new Intl.DateTimeFormat(
        i18n.language,
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(date)}`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("sessionHistory.title")}
          </DialogTitle>
          <DialogDescription>
            {t("sessionHistory.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <History className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <p className="font-medium text-foreground mb-1">
                {t("sessionHistory.empty")}
              </p>
              <p className="text-sm">
                {t("sessionHistory.emptyDescription")}
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 border rounded-md">
                <div className="p-4 space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(session.updatedAt)}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {session.messageCount}{" "}
                              {t("sessionHistory.messages")}
                            </Badge>
                          </div>
                          {session.preview && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {session.preview}
                            </p>
                          )}
                          {!session.preview && (
                            <p className="text-sm text-muted-foreground italic mb-2">
                              {t("sessionHistory.noPreview")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadSession(session)}
                          >
                            {t("sessionHistory.loadSession")}
                          </Button>
                          {deleteConfirmId === session.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteSession(session.id)}
                              >
                                {t("sessionHistory.deleteSession")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                {t("common.cancel")}
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirmId(session.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {sessions.length > 0 && (
                <div className="pt-4 border-t">
                  {showDeleteAllConfirm ? (
                    <div className="space-y-2">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          {t("sessionHistory.confirmDeleteAllMessage")}
                        </AlertDescription>
                      </Alert>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteAll}
                        >
                          {t("sessionHistory.confirmDeleteAll")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteAllConfirm(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteAllConfirm(true)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("sessionHistory.deleteAllSessions")}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <div className="w-full">
            <Alert>
              <AlertDescription className="text-xs">
                {t("sessionHistory.autoSaveNote")}
              </AlertDescription>
            </Alert>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            {t("common.done")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

