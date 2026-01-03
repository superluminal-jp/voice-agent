/**
 * Session Storage Utilities
 * 
 * Functions for saving and loading conversation session history to/from localStorage.
 */

import type { RealtimeItem } from "@openai/agents/realtime";
import {
  isRealtimeMessageItem,
  isUserMessage,
  isAssistantMessage,
  getItemId,
} from "@/types/realtime-session";
import { getItemText } from "./realtime-api";

const STORAGE_KEY = "voice-agent-sessions";
const MAX_SESSIONS = 100; // Maximum number of sessions to keep

/**
 * Agent configuration saved with session
 */
export interface SavedAgentConfig {
  name: string;
  instructions: string;
}

/**
 * Saved session data structure
 * 
 * Per OpenAI Realtime API documentation:
 * - history: Conversation history items (RealtimeItem[])
 * - agentConfig: Agent configuration (name, instructions) for session restoration
 * - sessionConfig: Session configuration (optional, may not be fully serializable)
 */
export interface SavedSession {
  id: string;
  createdAt: number;
  updatedAt: number;
  history: RealtimeItem[];
  messageCount: number;
  preview?: string; // First message preview
  agentConfig?: SavedAgentConfig; // Agent configuration (name, instructions)
  // Note: sessionConfig is not included as it contains non-serializable objects (transport, etc.)
  // Session config (VAD settings, etc.) should be recreated from current UI state
}

/**
 * Validate and sanitize RealtimeItem for session history
 * 
 * Per OpenAI Realtime API documentation:
 * - RealtimeMessageItem content structure varies by role and type
 * - For user messages: content can be input_text (text required) or input_audio (transcript required, audio optional)
 * - For assistant messages: content can be output_text (text required) or output_audio (audio/transcript optional)
 * - Null audio fields cause API errors, so we remove them
 * 
 * @param item - RealtimeItem to validate
 * @returns Validated and sanitized RealtimeItem, or null if item is invalid
 * 
 * @see https://openai.github.io/openai-agents-js/openai/agents/realtime/type-aliases/realtimemessageitem/
 */
function validateHistoryItem(item: RealtimeItem): RealtimeItem | null {
  // Must have required fields
  // Per OpenAI API: items must have type and itemId (not id)
  if (!item || !item.type) {
    return null;
  }

  // Ensure itemId exists (required field per OpenAI API)
  const itemId = getItemId(item);
  if (!itemId || typeof itemId !== "string" || itemId.trim().length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[validateHistoryItem] Item missing required itemId field:",
        item
      );
    }
    return null;
  }

  // Check if this is an in_progress message (needed for validation logic)
  // Per OpenAI API: in_progress messages may have empty content while being generated
  const isInProgress = isRealtimeMessageItem(item) && 
    (item.status === "in_progress" || item.status === "incomplete");
  
  // For message items, validate content structure per official documentation
  if (item.type === "message" && item.content) {
    
    if (Array.isArray(item.content)) {
      // For in_progress messages, allow empty content arrays
      // They will be updated when the message is completed
      if (isInProgress && item.content.length === 0) {
        // Return item as-is for in_progress messages with empty content
        // This allows tracking of messages that are still being generated
        return item;
      }
      
      // Filter and sanitize content items according to official API structure
      const validContent = item.content
        .filter((contentItem) => {
          if (!contentItem || typeof contentItem !== "object") {
            return false;
          }

          const contentType = contentItem.type;
          
          // Per OpenAI API: content items must have a valid type field
          // Reject items without a type field to prevent API errors
          if (!contentType || typeof contentType !== "string") {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "[validateHistoryItem] Content item missing type field:",
                contentItem
              );
            }
            return false;
          }

          // Per OpenAI API docs: input_text requires text
          if (contentType === "input_text") {
            return (
              contentItem.text !== null &&
              contentItem.text !== undefined &&
              typeof contentItem.text === "string" &&
              contentItem.text.trim().length > 0
            );
          }

          // Per OpenAI API docs: input_audio requires transcript
          // Per OpenAI API: audio field is optional and can be null if transcript is present
          if (contentType === "input_audio") {
            // Must have transcript
            const hasValidTranscript =
              contentItem.transcript !== null &&
              contentItem.transcript !== undefined &&
              typeof contentItem.transcript === "string" &&
              contentItem.transcript.trim().length > 0;
            
            // Per OpenAI API: audio is optional, transcript is required
            // If transcript exists, audio can be null (valid per OpenAI API)
            if (hasValidTranscript) {
              // transcript exists, so this is valid even if audio is null
              return true;
            }
            
            // No valid transcript - invalid
            return false;
          }

          // Per OpenAI API docs: output_text requires text
          if (contentType === "output_text") {
            return (
              contentItem.text !== null &&
              contentItem.text !== undefined &&
              typeof contentItem.text === "string" &&
              contentItem.text.trim().length > 0
            );
          }

          // Per OpenAI API docs: output_audio has optional audio and transcript
          // At least one should be present for completed messages
          // For in_progress messages, empty content is allowed
          // Note: audio field can be null if transcript is present (valid per API)
          if (contentType === "output_audio") {
            // For in_progress messages, allow empty output_audio content
            // The content will be populated as the message is generated
            // Per OpenAI API type definition: audio and transcript are both optional and can be null
            if (isInProgress) {
              // Allow output_audio items in in_progress messages even if empty
              // Per OpenAI API: audio?: string | null, transcript?: string | null
              // Both can be null/undefined for in_progress messages
              return true;
            }
            
            // For completed messages, require at least audio or transcript
            // Per OpenAI API: audio can be null if transcript is present
            const hasAudio =
              contentItem.audio !== null &&
              contentItem.audio !== undefined &&
              typeof contentItem.audio === "string" &&
              contentItem.audio.length > 0;
            const hasTranscript =
              contentItem.transcript !== null &&
              contentItem.transcript !== undefined &&
              typeof contentItem.transcript === "string" &&
              contentItem.transcript.trim().length > 0;
            
            // If transcript exists, audio can be null (valid per OpenAI API)
            // Only reject if both audio and transcript are missing
            if (hasTranscript) {
              // transcript exists, so this is valid even if audio is null
              return true;
            }
            
            // If no transcript, audio must be present and valid
            if (hasAudio) {
              return true;
            }
            
            // Both audio and transcript are missing or invalid
            return false;
          }

          // Per OpenAI API: unknown content types should be rejected
          // Only allow known types: input_text, input_audio, output_text, output_audio
          // This prevents API errors from malformed content items
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[validateHistoryItem] Unknown content type, rejecting:",
              {
                type: contentType,
                contentItem,
              }
            );
          }
          return false;
        })
        .map((contentItem) => {
          // Sanitize: remove null/undefined audio fields and type-incompatible fields to prevent API errors
          // Per OpenAI API: null audio causes "expected audio bytes, but got null" error
          // Also causes "Missing required parameter: 'item.content[0].audio'" error
          // Per OpenAI API: output_audio should not have text field, input_audio should not have text field
          const sanitized = { ...contentItem };
          
          // Remove type-incompatible fields based on content type
          // Per OpenAI API: each content type has specific required/optional fields
          if (sanitized.type === "output_audio" || sanitized.type === "input_audio") {
            // Audio types should not have text field
            // Per OpenAI API: audio types use transcript/audio, not text
            if (sanitized.hasOwnProperty("text")) {
              delete sanitized.text;
            }
          } else if (sanitized.type === "input_text" || sanitized.type === "output_text") {
            // Text types should not have audio/transcript fields
            // Per OpenAI API: text types use text field only
            if (sanitized.hasOwnProperty("audio")) {
              delete sanitized.audio;
            }
            if (sanitized.hasOwnProperty("transcript")) {
              delete sanitized.transcript;
            }
          }
          
          // Remove null/undefined audio fields - they cause API errors
          // Per OpenAI API: null audio fields cause "expected audio bytes, but got null" error
          // This applies to both input_audio and output_audio
          if (sanitized.audio === null || sanitized.audio === undefined) {
            delete sanitized.audio;
          }
          
          // Remove null/undefined transcript if it's not required
          // For output_audio, transcript is optional
          // For input_audio, transcript is required, so don't delete it
          if (
            sanitized.type === "output_audio" &&
            (sanitized.transcript === null || sanitized.transcript === undefined)
          ) {
            delete sanitized.transcript;
          }
          
          // Ensure required fields are present based on type
          // Per OpenAI API: content[0] must have either text or audio (depending on type)
          if (sanitized.type === "input_text" || sanitized.type === "output_text") {
            // Text-based types must have text field
            if (!sanitized.text || typeof sanitized.text !== "string" || sanitized.text.trim().length === 0) {
              // This should have been filtered out, but double-check
              return null;
            }
          } else if (sanitized.type === "input_audio") {
            // Input audio must have transcript
            if (!sanitized.transcript || typeof sanitized.transcript !== "string" || sanitized.transcript.trim().length === 0) {
              // This should have been filtered out, but double-check
              return null;
            }
          } else if (sanitized.type === "output_audio") {
            // Output audio must have at least audio or transcript for completed messages
            // For in_progress messages, empty content is allowed (handled earlier in filter)
            const hasAudio = sanitized.audio && typeof sanitized.audio === "string" && sanitized.audio.length > 0;
            const hasTranscript = sanitized.transcript && typeof sanitized.transcript === "string" && sanitized.transcript.trim().length > 0;
            
            // For in_progress messages, allow empty output_audio
            if (isInProgress) {
              // Already handled in filter, but double-check here
              return sanitized;
            }
            
            if (!hasAudio && !hasTranscript) {
              // This should have been filtered out, but double-check
              return null;
            }
          }
          
          return sanitized;
        })
        .filter((contentItem) => {
          // Final validation: ensure content item is not null and has required structure
          if (contentItem === null) {
            return false;
          }
          
          // Per OpenAI API: content items must have a type field after sanitization
          if (!contentItem.type || typeof contentItem.type !== "string") {
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "[validateHistoryItem] Content item missing type after sanitization:",
                contentItem
              );
            }
            return false;
          }
          
          // Verify required fields exist for each type after sanitization
          const type = contentItem.type;
          if (type === "input_text" || type === "output_text") {
            const hasValidText = contentItem.text && 
              typeof contentItem.text === "string" && 
              contentItem.text.trim().length > 0;
            if (!hasValidText) {
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  "[validateHistoryItem] Text content missing required 'text' field after sanitization:",
                  { type, contentItem }
                );
              }
              return false;
            }
          } else if (type === "input_audio") {
            const hasValidTranscript = contentItem.transcript && 
              typeof contentItem.transcript === "string" && 
              contentItem.transcript.trim().length > 0;
            if (!hasValidTranscript) {
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  "[validateHistoryItem] Input audio missing required 'transcript' field after sanitization:",
                  contentItem
                );
              }
              return false;
            }
          } else if (type === "output_audio") {
            // For output_audio, we need at least transcript or audio
            const hasAudio = contentItem.audio && 
              typeof contentItem.audio === "string" && 
              contentItem.audio.length > 0;
            const hasTranscript = contentItem.transcript && 
              typeof contentItem.transcript === "string" && 
              contentItem.transcript.trim().length > 0;
            
            // For completed messages, require at least one of audio/transcript
            if (!isInProgress && !hasAudio && !hasTranscript) {
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  "[validateHistoryItem] Output audio missing both 'audio' and 'transcript' after sanitization:",
                  contentItem
                );
              }
              return false;
            }
          }
          
          return true;
        });

      // If no valid content remains, check if this is an in_progress message
      // Per OpenAI API: in_progress messages may have empty content while being generated
      if (validContent.length === 0) {
        // Allow in_progress messages with empty content (they will be updated later)
        if (isInProgress) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[validateHistoryItem] Allowing in_progress message with empty content:",
              {
                itemId: getItemId(item),
                role: isRealtimeMessageItem(item) ? item.role : undefined,
                status: isRealtimeMessageItem(item) ? item.status : undefined,
              }
            );
          }
          // Return item with empty content array for in_progress messages
          return {
            ...item,
            content: [],
          };
        }
        
        // For completed messages, empty content is invalid
        // Log detailed information about why content was filtered out
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[validateHistoryItem] Message item has no valid content, removing:",
            {
              itemId: getItemId(item),
              role: isRealtimeMessageItem(item) ? item.role : undefined,
              status: isRealtimeMessageItem(item) ? item.status : undefined,
              originalContentLength: item.content.length,
              originalContent: item.content,
              // Log first content item details for debugging
              firstContentItem: Array.isArray(item.content) && item.content.length > 0 
                ? {
                    type: item.content[0]?.type,
                    hasText: !!item.content[0]?.text,
                    hasTranscript: !!item.content[0]?.transcript,
                    hasAudio: !!item.content[0]?.audio,
                    audioValue: item.content[0]?.audio,
                    transcriptValue: item.content[0]?.transcript,
                    textValue: item.content[0]?.text,
                    fullItem: item.content[0],
                  }
                : null,
            }
          );
        }
        return null;
      }

      // Return item with sanitized content
      return {
        ...item,
        content: validContent,
      };
    } else if (typeof item.content === "string") {
      // Content is a string - this is valid for some message types
      // Ensure it's not empty
      if (item.content.trim().length === 0) {
        return null;
      }
      return item;
    } else {
      // Content is neither array nor string - invalid
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[validateHistoryItem] Message item has invalid content type:",
          {
            itemId: getItemId(item),
            role: isRealtimeMessageItem(item) ? item.role : undefined,
            contentType: typeof item.content,
          }
        );
      }
      return null;
    }
  }

  // For non-message items (function_call, function_call_output, etc.), return as-is
  // These don't have the same content structure requirements
  return item;
}

/**
 * Prepare history for session restoration
 * 
 * Per OpenAI Realtime API: updateHistory() does not accept output_audio content
 * This function converts audio content to text content for restoration:
 * - output_audio → output_text (using transcript as text)
 * - input_audio → input_text (using transcript as text)
 * - Removes audio data (not needed for text-based restoration)
 * 
 * @param history - Array of RealtimeItem to prepare
 * @returns History array prepared for updateHistory() call
 */
export function prepareHistoryForRestore(history: RealtimeItem[]): RealtimeItem[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map(validateHistoryItem)
    .filter((item): item is RealtimeItem => {
      if (item === null) {
        return false;
      }
      
      // Filter out incomplete messages
      if (isRealtimeMessageItem(item)) {
        const status = item.status;
        if (status === "in_progress" || status === "incomplete") {
          return false;
        }
        
        if (Array.isArray(item.content) && item.content.length === 0) {
          return false;
        }
      }
      
      return true;
    })
    .map((item) => {
      // Convert audio content to text content for restoration
      if (isRealtimeMessageItem(item) && Array.isArray(item.content)) {
        const convertedContent = item.content.map((contentItem) => {
          // Convert output_audio to output_text
          if (contentItem.type === "output_audio") {
            const transcript = contentItem.transcript;
            if (transcript && typeof transcript === "string" && transcript.trim().length > 0) {
              return {
                type: "output_text" as const,
                text: transcript,
              };
            }
            // If no transcript, return empty text (should be filtered by validation)
            return {
              type: "output_text" as const,
              text: "",
            };
          }
          
          // Convert input_audio to input_text
          if (contentItem.type === "input_audio") {
            const transcript = contentItem.transcript;
            if (transcript && typeof transcript === "string" && transcript.trim().length > 0) {
              return {
                type: "input_text" as const,
                text: transcript,
              };
            }
            // If no transcript, return empty text (should be filtered by validation)
            return {
              type: "input_text" as const,
              text: "",
            };
          }
          
          // Keep text content as-is
          return contentItem;
        });
        
        return {
          ...item,
          content: convertedContent,
        };
      }
      
      return item;
    });
}

/**
 * Validate and sanitize history array
 * 
 * Per OpenAI Realtime API documentation:
 * - Validates and sanitizes RealtimeItem array according to API requirements
 * - Removes invalid items and sanitizes content structure
 * - Filters out incomplete messages (in_progress/incomplete status or empty content)
 * - Exported for use in components that need to validate history before API calls
 * 
 * @param history - Array of RealtimeItem to validate
 * @returns Validated and sanitized history array
 */
export function validateHistory(history: RealtimeItem[]): RealtimeItem[] {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map(validateHistoryItem)
    .filter((item): item is RealtimeItem => {
      if (item === null) {
        return false;
      }
      
      // Filter out incomplete messages that should not be persisted or restored
      // Per OpenAI API: messages with in_progress or incomplete status are transient
      // and should not be passed to updateHistory() as they lack required content
      if (isRealtimeMessageItem(item)) {
        const status = item.status;
        if (status === "in_progress" || status === "incomplete") {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[validateHistory] Filtering out incomplete message:",
              {
                itemId: getItemId(item),
                role: item.role,
                status: item.status,
                hasContent: Array.isArray(item.content) && item.content.length > 0,
              }
            );
          }
          return false;
        }
        
        // Also filter out messages with empty content arrays
        // Per OpenAI API: messages must have at least one content item with required fields
        if (Array.isArray(item.content) && item.content.length === 0) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "[validateHistory] Filtering out message with empty content:",
              {
                itemId: getItemId(item),
                role: item.role,
                status: item.status,
              }
            );
          }
          return false;
        }
      }
      
      return true;
    });
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all saved sessions from localStorage
 */
export function getAllSessions(): SavedSession[] {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const sessions: SavedSession[] = JSON.parse(data);
    // Validate and sanitize history for each session
    const validatedSessions = sessions.map((session) => ({
      ...session,
      history: validateHistory(session.history),
    }));
    // Sort by updatedAt descending (newest first)
    return validatedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("Error loading sessions from localStorage:", error);
    return [];
  }
}

/**
 * Get a specific session by ID
 */
export function getSession(sessionId: string): SavedSession | null {
  const sessions = getAllSessions();
  const session = sessions.find((s) => s.id === sessionId) || null;
  if (session) {
    // Ensure history is validated
    session.history = validateHistory(session.history);
  }
  return session;
}

/**
 * Save or update a session
 * 
 * @param sessionId - Unique session identifier
 * @param history - Conversation history items
 * @param agentConfig - Optional agent configuration (name, instructions) to save with session
 */
export function saveSession(
  sessionId: string,
  history: RealtimeItem[],
  agentConfig?: SavedAgentConfig
): void {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available, cannot save session");
    return;
  }

  try {
    const sessions = getAllSessions();
    const existingIndex = sessions.findIndex((s) => s.id === sessionId);
    const now = Date.now();

    // Validate and sanitize history before saving
    const validatedHistory = validateHistory(history);

    // Debug logging for troubleshooting "0 messages" issue
    if (process.env.NODE_ENV === "development") {
      const originalMessageCount = history.filter(
        (item) => item.type === "message"
      ).length;
      const validatedMessageCount = validatedHistory.filter(
        (item) => item.type === "message"
      ).length;
      if (originalMessageCount !== validatedMessageCount) {
        console.warn(
          `[saveSession] Message count changed during validation: ${originalMessageCount} -> ${validatedMessageCount}`,
          {
            sessionId,
            originalHistoryLength: history.length,
            validatedHistoryLength: validatedHistory.length,
          }
        );
      }
    }

    // Generate preview from first user or assistant message
    // Per OpenAI API: use type guards to safely access message properties
    let preview: string | undefined;
    const firstMessage = validatedHistory.find(
      (item) => isUserMessage(item) || isAssistantMessage(item)
    );
    if (firstMessage) {
      const text = getItemText(firstMessage);
      preview = text.length > 100 ? text.substring(0, 100) + "..." : text;
    }

    // Count only message items (not function_call, function_call_output, etc.)
    // Per OpenAI API: messageCount should reflect actual conversation messages
    const messageCount = validatedHistory.filter(
      (item) => item.type === "message"
    ).length;

    const sessionData: SavedSession = {
      id: sessionId,
      createdAt: existingIndex >= 0 ? sessions[existingIndex].createdAt : now,
      updatedAt: now,
      history: validatedHistory,
      messageCount,
      preview,
      // Preserve existing agentConfig if not provided, otherwise use new one
      agentConfig: agentConfig ?? (existingIndex >= 0 ? sessions[existingIndex].agentConfig : undefined),
    };

    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = sessionData;
    } else {
      // Add new session
      sessions.push(sessionData);

      // Limit total number of sessions
      if (sessions.length > MAX_SESSIONS) {
        // Remove oldest sessions (keep newest MAX_SESSIONS)
        sessions.sort((a, b) => b.updatedAt - a.updatedAt);
        sessions.splice(MAX_SESSIONS);
      }
    }

    // Sort by updatedAt descending before saving
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session to localStorage:", error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, trying to free space");
      // Try to remove oldest sessions
      try {
        const sessions = getAllSessions();
        if (sessions.length > 10) {
          sessions.sort((a, b) => b.updatedAt - a.updatedAt);
          sessions.splice(10);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
          // Retry saving
          saveSession(sessionId, history);
        }
      } catch (retryError) {
        console.error("Failed to free localStorage space:", retryError);
      }
    }
  }
}

/**
 * Delete a session by ID
 */
export function deleteSession(sessionId: string): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return false;
  }

  try {
    const sessions = getAllSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);

    if (filtered.length === sessions.length) {
      // Session not found
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting session from localStorage:", error);
    return false;
  }
}

/**
 * Delete all sessions
 */
export function deleteAllSessions(): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn("localStorage is not available");
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error deleting all sessions from localStorage:", error);
    return false;
  }
}

/**
 * Generate a new session ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
