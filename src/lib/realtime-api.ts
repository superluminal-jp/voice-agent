/**
 * Realtime API Utilities
 *
 * Helper functions for OpenAI Realtime API integration.
 * Based on OpenAI Realtime API official documentation:
 * https://platform.openai.com/docs/guides/realtime
 */

/**
 * Generate ephemeral key for OpenAI Realtime API
 *
 * Creates a temporary API key for client-side authentication.
 * This key is scoped to a specific session and expires after use.
 *
 * @returns Promise resolving to the ephemeral API key
 * @throws Error if API key is missing, network request fails, or API returns an error
 *
 * @example
 * ```typescript
 * const ephemeralKey = await generateEphemeralKey();
 * await session.connect({ apiKey: ephemeralKey });
 * ```
 */
export async function generateEphemeralKey(): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable."
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-realtime",
          },
        }),
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to generate ephemeral key (HTTP ${response.status})`;

      try {
        const errorData = await response.json();
        // OpenAI API typically returns error details in error.message or error.type
        if (errorData.error) {
          errorMessage =
            errorData.error.message || errorData.error.type || errorMessage;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } catch {
        // If JSON parsing fails, try to get text response
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.value || typeof data.value !== "string") {
      throw new Error(
        "Invalid response format: expected 'value' field with string ephemeral key"
      );
    }

    return data.value;
  } catch (error) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }

    // Handle network errors or other unexpected errors
    throw new Error(`Failed to generate ephemeral key: ${String(error)}`);
  }
}

/**
 * Content item types from OpenAI Realtime API
 * Based on official API documentation
 * Per OpenAI API: content items can be input_text, input_audio, output_text, or output_audio
 */
interface ContentItem {
  type?: "input_text" | "input_audio" | "output_text" | "output_audio" | "text" | "transcript";
  text?: string;
  transcript?: string;
  audio?: string | null;
  content?: string;
  value?: string;
  input?: string;
  output?: string;
  [key: string]: unknown;
}

/**
 * RealtimeItem structure from OpenAI Realtime API
 * Based on official API documentation
 */
interface RealtimeItemLike {
  type: string;
  role?: "user" | "assistant" | "system";
  content?: string | ContentItem[];
  transcript?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Extract text content from RealtimeItem
 *
 * Handles various message formats from OpenAI Realtime API according to official documentation:
 * - Messages with content array containing text/transcript objects (most common)
 * - Messages with direct content string
 * - Messages with transcript property (legacy format)
 * - Messages with input_text or input_audio content types
 *
 * @param item - RealtimeItem from OpenAI Realtime API
 * @returns Extracted text content, or empty string if no text found
 *
 * @example
 * ```typescript
 * const text = getItemText(realtimeItem);
 * ```
 */
export function getItemText(item: RealtimeItemLike): string {
  // Handle message type items
  if (item.type === "message") {
    // Case 1: content is an array (most common format per OpenAI API docs)
    if (item.content && Array.isArray(item.content)) {
      const texts = item.content
        .map((c: ContentItem | string) => {
          // Handle null or undefined content items
          if (!c) return "";

          // If content item is a string, return it directly
          if (typeof c === "string") {
            return c.trim();
          }

          // If content item is an object, check for text/transcript properties
          // Per OpenAI API docs, content items can have:
          // - type: "input_text" with text property
          // - type: "input_audio" with transcript property
          // - text or transcript properties directly
          if (typeof c === "object" && c !== null) {
            const contentItem = c as ContentItem;
            // Check for text property (input_text type or direct text)
            // Per OpenAI API: type "input_text" contains user text input
            if (
              contentItem.text !== undefined &&
              contentItem.text !== null &&
              String(contentItem.text).trim().length > 0
            ) {
              return String(contentItem.text).trim();
            }

            // Check for transcript property (input_audio type)
            // Per OpenAI API: type "input_audio" contains transcribed speech
            if (
              contentItem.transcript !== undefined &&
              contentItem.transcript !== null &&
              String(contentItem.transcript).trim().length > 0
            ) {
              return String(contentItem.transcript).trim();
            }

            // Check for type property and corresponding text/transcript
            // This handles explicit type declarations per OpenAI API spec
            // Per OpenAI API: input_text and output_text have text property
            if (
              (contentItem.type === "input_text" || contentItem.type === "output_text") &&
              contentItem.text &&
              String(contentItem.text).trim().length > 0
            ) {
              return String(contentItem.text).trim();
            }
            // Per OpenAI API: input_audio and output_audio have transcript property
            if (
              (contentItem.type === "input_audio" || contentItem.type === "output_audio") &&
              contentItem.transcript &&
              String(contentItem.transcript).trim().length > 0
            ) {
              return String(contentItem.transcript).trim();
            }

            // Check for other common property names (fallback for non-standard formats)
            if (
              contentItem.content !== undefined &&
              contentItem.content !== null
            ) {
              const contentStr =
                typeof contentItem.content === "string"
                  ? contentItem.content
                  : String(contentItem.content);
              if (contentStr.trim().length > 0) {
                return contentStr.trim();
              }
            }

            // If object has a value property, try that (fallback)
            if (contentItem.value !== undefined && contentItem.value !== null) {
              const valueStr =
                typeof contentItem.value === "string"
                  ? contentItem.value
                  : String(contentItem.value);
              if (valueStr.trim().length > 0) {
                return valueStr.trim();
              }
            }

            // Check for input/output properties (fallback)
            if (contentItem.input !== undefined && contentItem.input !== null) {
              const inputStr =
                typeof contentItem.input === "string"
                  ? contentItem.input
                  : String(contentItem.input);
              if (inputStr.trim().length > 0) {
                return inputStr.trim();
              }
            }
            if (
              contentItem.output !== undefined &&
              contentItem.output !== null
            ) {
              const outputStr =
                typeof contentItem.output === "string"
                  ? contentItem.output
                  : String(contentItem.output);
              if (outputStr.trim().length > 0) {
                return outputStr.trim();
              }
            }

            // Last resort: try to stringify the object if it's a simple structure
            // But only if it looks like it might contain text
            const keys = Object.keys(contentItem);
            if (keys.length === 1 && keys[0] !== "type") {
              const singleValue = contentItem[keys[0]];
              if (
                typeof singleValue === "string" &&
                singleValue.trim().length > 0
              ) {
                return singleValue.trim();
              }
            }
          }

          return "";
        })
        .filter((text: string) => text.length > 0);

      if (texts.length > 0) {
        return texts.join(" ");
      }

      // Check if this is a message in progress (status: "in_progress" or similar)
      // These are temporary states and don't need warnings per OpenAI API behavior
      const isInProgress =
        item.status === "in_progress" || item.status === "pending";

      // Only warn if this is a completed message without text
      // Skip warnings for in-progress messages or messages without content
      if (
        !isInProgress &&
        item.content &&
        Array.isArray(item.content) &&
        item.content.length > 0
      ) {
        // Check if content array has any non-empty objects
        const hasNonEmptyContent = item.content.some(
          (c: ContentItem | string) => {
            if (!c || typeof c !== "object") return false;
            const contentItem = c as ContentItem;
            return (
              (contentItem.text !== undefined &&
                contentItem.text !== null &&
                String(contentItem.text).trim().length > 0) ||
              (contentItem.transcript !== undefined &&
                contentItem.transcript !== null &&
                String(contentItem.transcript).trim().length > 0) ||
              (contentItem.value !== undefined &&
                contentItem.value !== null &&
                String(contentItem.value).trim().length > 0)
            );
          }
        );

        // Only warn if there's content that should have been extracted
        // This helps debug API response format changes
        if (hasNonEmptyContent && process.env.NODE_ENV === "development") {
          console.warn(
            "[getItemText] Could not extract text from content array:",
            {
              content: item.content,
              role: item.role,
              type: item.type,
              status: item.status,
            }
          );
        }
      }
    }

    // Case 2: content is a direct string
    if (item.content && typeof item.content === "string") {
      return item.content.trim();
    }

    // Case 3: transcript property exists (legacy format)
    if ("transcript" in item && item.transcript) {
      return String(item.transcript).trim();
    }

    // Case 4: content exists but is not array or string
    if (item.content) {
      const contentStr = String(item.content).trim();
      if (
        contentStr &&
        contentStr !== "undefined" &&
        contentStr !== "null" &&
        contentStr !== "[object Object]"
      ) {
        return contentStr;
      }
    }
  }

  // For non-message types (function_call, function_call_output, etc.), return formatted JSON
  // This helps with debugging and displaying non-text content
  // But only if it's not an empty object
  const jsonStr = JSON.stringify(item, null, 2);
  if (jsonStr && jsonStr !== "{}" && jsonStr !== "null") {
    // Only return JSON if it's not a message type (messages should have extractable text)
    // Per OpenAI API: function calls and outputs may not have text content
    if (item.type !== "message") {
      return jsonStr;
    }
  }

  // Final fallback: return empty string if nothing found
  // This is expected for in-progress messages or empty content
  return "";
}
