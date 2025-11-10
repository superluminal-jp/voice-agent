/**
 * Type definitions for OpenAI Realtime API
 * Based on official @openai/agents-realtime SDK type definitions
 * 
 * @see https://openai.github.io/openai-agents-js/openai/agents/realtime/
 */

import type {
  RealtimeItem,
  RealtimeMessageItem,
  RealtimeToolCallItem,
  RealtimeMcpCallItem,
  RealtimeBaseItem,
} from "@openai/agents/realtime";

/**
 * Re-export official types for convenience
 */
export type {
  RealtimeItem,
  RealtimeMessageItem,
  RealtimeToolCallItem,
  RealtimeMcpCallItem,
  RealtimeBaseItem,
};

/**
 * RealtimeMessageItem content types
 * Per OpenAI API: content structure varies by role
 */
export type RealtimeMessageContent =
  | {
      type: "input_text";
      text: string;
    }
  | {
      type: "input_audio";
      transcript: string | null;
      audio?: string | null;
    }
  | {
      type: "output_text";
      text: string;
    }
  | {
      type: "output_audio";
      audio?: string | null;
      transcript?: string | null;
    };

/**
 * System message item
 * Per OpenAI API: system messages have role "system" and content with input_text
 */
export type RealtimeSystemMessageItem = RealtimeBaseItem & {
  type: "message";
  role: "system";
  content: Array<{
    type: "input_text";
    text: string;
  }>;
  previousItemId?: string | null;
};

/**
 * User message item
 * Per OpenAI API: user messages have role "user", status, and content with input_text or input_audio
 */
export type RealtimeUserMessageItem = RealtimeBaseItem & {
  type: "message";
  role: "user";
  status: "in_progress" | "completed";
  content: Array<
    | {
        type: "input_text";
        text: string;
      }
    | {
        type: "input_audio";
        transcript: string | null;
        audio?: string | null;
      }
  >;
  previousItemId?: string | null;
};

/**
 * Assistant message item
 * Per OpenAI API: assistant messages have role "assistant", status, and content with output_text or output_audio
 */
export type RealtimeAssistantMessageItem = RealtimeBaseItem & {
  type: "message";
  role: "assistant";
  status: "in_progress" | "completed" | "incomplete";
  content: Array<
    | {
        type: "output_text";
        text: string;
      }
    | {
        type: "output_audio";
        audio?: string | null;
        transcript?: string | null;
      }
  >;
  previousItemId?: string | null;
};

/**
 * Tool call item
 * Per OpenAI API: function_call items represent tool/function calls
 */
export type RealtimeToolCallItemType = RealtimeBaseItem & {
  type: "function_call";
  status: "in_progress" | "completed" | "incomplete";
  name: string;
  arguments: string;
  output: string | null;
  previousItemId?: string | null;
};

/**
 * MCP call item
 * Per OpenAI API: mcp_call and mcp_tool_call items represent MCP tool calls
 */
export type RealtimeMcpCallItemType = RealtimeBaseItem & {
  type: "mcp_call" | "mcp_tool_call";
  status: "in_progress" | "completed" | "incomplete";
  name: string;
  arguments: string;
  output: string | null;
  previousItemId?: string | null;
};

/**
 * Type guard: Check if item is a message item
 */
export function isRealtimeMessageItem(
  item: RealtimeItem
): item is RealtimeMessageItem {
  return item.type === "message";
}

/**
 * Type guard: Check if item is a user message
 */
export function isUserMessage(
  item: RealtimeItem
): item is RealtimeUserMessageItem {
  return isRealtimeMessageItem(item) && item.role === "user";
}

/**
 * Type guard: Check if item is an assistant message
 */
export function isAssistantMessage(
  item: RealtimeItem
): item is RealtimeAssistantMessageItem {
  return isRealtimeMessageItem(item) && item.role === "assistant";
}

/**
 * Type guard: Check if item is a system message
 */
export function isSystemMessage(
  item: RealtimeItem
): item is RealtimeSystemMessageItem {
  return isRealtimeMessageItem(item) && item.role === "system";
}

/**
 * Type guard: Check if item is a tool call
 */
export function isToolCallItem(
  item: RealtimeItem
): item is RealtimeToolCallItem {
  return item.type === "function_call";
}

/**
 * Type guard: Check if item is an MCP call
 */
export function isMcpCallItem(
  item: RealtimeItem
): item is RealtimeMcpCallItem {
  return item.type === "mcp_call" || item.type === "mcp_tool_call";
}

/**
 * Type guard: Check if item is any type of tool/function call (including MCP)
 */
export function isAnyToolCall(item: RealtimeItem): boolean {
  return isToolCallItem(item) || isMcpCallItem(item);
}

/**
 * Get tool call name from any tool/function call item
 */
export function getToolCallName(item: RealtimeItem): string | null {
  if (isToolCallItem(item)) {
    return item.name || null;
  }
  if (isMcpCallItem(item)) {
    return item.name || null;
  }
  return null;
}

/**
 * Get tool call arguments from any tool/function call item
 */
export function getToolCallArguments(item: RealtimeItem): string | null {
  if (isToolCallItem(item)) {
    return item.arguments || null;
  }
  if (isMcpCallItem(item)) {
    return item.arguments || null;
  }
  return null;
}

/**
 * Get tool call output from any tool/function call item
 */
export function getToolCallOutput(item: RealtimeItem): string | null {
  if (isToolCallItem(item)) {
    return item.output || null;
  }
  if (isMcpCallItem(item)) {
    return item.output || null;
  }
  return null;
}

/**
 * Get tool call status from any tool/function call item
 */
export function getToolCallStatus(
  item: RealtimeItem
): "in_progress" | "completed" | "incomplete" | null {
  if (isToolCallItem(item)) {
    return item.status || null;
  }
  if (isMcpCallItem(item)) {
    return item.status || null;
  }
  return null;
}

/**
 * Get message item ID
 * Per OpenAI API: items use `itemId` field, not `id`
 */
export function getItemId(item: RealtimeItem): string {
  return "itemId" in item ? item.itemId : "";
}

