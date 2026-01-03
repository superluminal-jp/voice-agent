/**
 * Voice Activity Detection (VAD) Configuration
 * 
 * Presets for different VAD sensitivity levels.
 * 
 * Per OpenAI Realtime API documentation:
 * - semantic_vad: Uses semantic analysis to detect when user finishes speaking
 *   - eagerness: "low" | "medium" | "high" (how quickly to detect end of speech)
 *   - createResponse: true (automatically create response when turn ends)
 *   - interruptResponse: true (allow user to interrupt AI response)
 * 
 * - server_vad: Uses audio level and silence detection
 *   - threshold: 0.0 - 1.0 (sensitivity to detect speech)
 *   - silence_duration_ms: milliseconds of silence to detect end of turn
 *   - prefix_padding_ms: milliseconds of audio to capture before speech starts
 *   - createResponse: true (automatically create response when turn ends)
 *   - interruptResponse: true (allow user to interrupt AI response)
 */

import type { VadMode, InputMode } from "@/types/voice-agent";

export const VAD_PRESETS = {
  conservative: {
    type: "semantic_vad" as const,
    eagerness: "low" as const,
    createResponse: true,
    interruptResponse: true,
  },
  balanced: {
    type: "server_vad" as const,
    threshold: 0.6,
    silence_duration_ms: 800,
    prefix_padding_ms: 300,
    createResponse: true,
    interruptResponse: true,
  },
  responsive: {
    type: "server_vad" as const,
    threshold: 0.5,
    silence_duration_ms: 500,
    prefix_padding_ms: 300,
    createResponse: true,
    interruptResponse: true,
  },
} as const;

/**
 * Get VAD configuration for a given mode
 * For PTT/Toggle modes, returns null to disable automatic turn detection
 * This allows manual control - user must explicitly end turns
 */
export function getVadConfig(mode: VadMode, inputMode?: InputMode): typeof VAD_PRESETS[VadMode] | null {
  // For PTT/Toggle modes, disable VAD completely
  // This prevents automatic turn ending when microphone is turned off
  // User has full manual control over when to end their turn
  if (inputMode === "push_to_talk" || inputMode === "toggle") {
    return null;
  }
  
  return VAD_PRESETS[mode];
}

