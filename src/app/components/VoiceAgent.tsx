"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  RealtimeAgent,
  RealtimeSession,
  RealtimeItem,
  OpenAIRealtimeWebRTC,
} from "@openai/agents/realtime";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Volume2,
  Settings,
  Mic,
  Speaker,
  RefreshCw,
  Monitor,
  Info,
  PhoneOff,
  ChevronDown,
  ChevronUp,
  Play,
  Square,
  FileText,
  Pencil,
} from "lucide-react";

// Types and utilities
import type { VadMode, InputMode } from "@/types/voice-agent";
import { getVadConfig } from "@/lib/vad-config";
import { mixAudioStreams } from "@/lib/audio-utils";
import { generateEphemeralKey } from "@/lib/realtime-api";

// Hooks
import { useAudioDevices } from "@/hooks/useAudioDevices";
import { useSystemAudio } from "@/hooks/useSystemAudio";
import { usePTT } from "@/hooks/usePTT";
import { useAudioLevel } from "@/hooks/useAudioLevel";

// Components
import { ConnectionStatus } from "./voice-agent/ConnectionStatus";
import { ErrorAlert } from "./voice-agent/ErrorAlert";
import { ConversationHistory } from "./voice-agent/ConversationHistory";
import { TextInput } from "./voice-agent/TextInput";
import { SessionHistoryList } from "./voice-agent/SessionHistoryList";
import { useTranslation } from "react-i18next";
import {
  getSystemPromptTemplates,
  getTemplateById,
  type SystemPromptTemplate,
} from "@/lib/system-prompt-templates";
import {
  generateSessionId,
  validateHistory,
  prepareHistoryForRestore,
  saveSession,
  deleteSession,
  type SavedSession,
} from "@/lib/session-storage";
import {
  isRealtimeMessageItem,
  isUserMessage,
  isAssistantMessage,
  getItemId,
} from "@/types/realtime-session";

export default function VoiceAgent() {
  const { t, i18n } = useTranslation();
  const SYSTEM_PROMPT_TEMPLATES = getSystemPromptTemplates(i18n.language);

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversation state
  const [conversationHistory, setConversationHistory] = useState<
    RealtimeItem[]
  >([]);
  const defaultTemplate = getTemplateById("default", i18n.language);
  const [systemPrompt, setSystemPrompt] = useState(
    defaultTemplate?.prompt ?? ""
  );
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [tempPrompt, setTempPrompt] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>("default");
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false);
  const [isSessionHistoryDialogOpen, setIsSessionHistoryDialogOpen] =
    useState(false);

  // Session management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Microphone test state
  const [isTestingMicrophone, setIsTestingMicrophone] = useState(false);
  const [testMicStream, setTestMicStream] = useState<MediaStream | null>(null);
  const testMicAudioLevel = useAudioLevel(testMicStream);
  const testMicStreamRef = useRef<MediaStream | null>(null);

  // Collapsible sections state
  const [showAdvancedInfo, setShowAdvancedInfo] = useState(false);

  // Input control state
  const [vadMode, setVadMode] = useState<VadMode>("conservative");
  const [inputMode, setInputMode] = useState<InputMode>("always_on");
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // Audio state
  const [mixedAudioStream, setMixedAudioStream] = useState<MediaStream | null>(
    null
  );
  const [micStream, setMicStream] = useState<MediaStream | null>(null);

  // Refs
  const sessionRef = useRef<RealtimeSession | null>(null);
  const systemAudioGainRef = useRef<GainNode | null>(null);
  const agentRef = useRef<RealtimeAgent | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const finalAudioStreamRef = useRef<MediaStream | null>(null);
  const transportRef = useRef<OpenAIRealtimeWebRTC | null>(null);

  // Custom hooks
  const audioDevicesHook = useAudioDevices();
  const systemAudioHook = useSystemAudio();
  const pttHook = usePTT(inputMode, isConnected);

  // Monitor audio levels
  const inputAudioLevel = useAudioLevel(micStream);

  // Extract values from hooks
  const {
    devices: audioDevices,
    selectedMicrophone,
    selectedSpeaker,
    isLoading: isLoadingDevices,
    setSelectedMicrophone,
    setSelectedSpeaker,
    refreshDevices: enumerateAudioDevices,
  } = audioDevicesHook;

  const {
    enabled: systemAudioEnabled,
    stream: systemAudioStream,
    capture: captureSystemAudio,
    stop: stopSystemAudio,
  } = systemAudioHook;

  const {
    isPTTActive,
    setIsPTTActive,
    micGainRef,
    audioStreamRef: pttAudioStreamRef,
  } = pttHook;

  // Update default system prompt when language changes
  const previousLanguageRef = useRef<string>(i18n.language);
  useEffect(() => {
    // Only update if language actually changed
    if (previousLanguageRef.current !== i18n.language) {
      const defaultTemplate = getTemplateById("default", i18n.language);
      if (defaultTemplate) {
        // Only update if the current prompt matches the previous default template
        // This prevents overwriting user-customized prompts
        const previousDefaultTemplate = getTemplateById(
          "default",
          previousLanguageRef.current
        );
        if (
          previousDefaultTemplate &&
          systemPrompt === previousDefaultTemplate.prompt
        ) {
          setSystemPrompt(defaultTemplate.prompt);
        } else if (systemPrompt === "") {
          // Empty prompt - set to new default
          setSystemPrompt(defaultTemplate.prompt);
        }
      }
      previousLanguageRef.current = i18n.language;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  // Sync PTT audio stream ref with final audio stream ref
  // Monitor mixedAudioStream state to sync when it changes
  useEffect(() => {
    pttAudioStreamRef.current = finalAudioStreamRef.current;
  }, [pttAudioStreamRef, mixedAudioStream, isConnected]);

  // Note: PTT/Toggle mode control is handled by usePTT hook via track.enabled
  // RealtimeAPI automatically detects user interruption when microphone is enabled
  // and user starts speaking, so no manual session.interrupt() calls are needed

  // Handle system audio errors
  useEffect(() => {
    if (systemAudioHook.error) {
      setError(systemAudioHook.error);
    }
  }, [systemAudioHook.error]);

  /**
   * Connect to OpenAI Realtime API
   *
   * Establishes a WebRTC connection to OpenAI Realtime API using ephemeral key authentication.
   * Sets up audio streams, transport, session, and event listeners.
   *
   * Per OpenAI API documentation:
   * - Uses ephemeral keys for secure client-side authentication
   * - Creates RealtimeAgent with system prompt instructions
   * - Configures WebRTC transport with mixed audio stream
   * - Sets up VAD configuration based on input mode
   *
   * @param initialHistory Optional initial conversation history to load into the session
   * @throws Error if connection fails (API key, network, or audio device issues)
   */
  const connect = async (initialHistory?: RealtimeItem[]) => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Generate ephemeral key for secure authentication
      // Per OpenAI API: ephemeral keys are scoped to a session and expire after use
      const ephemeralKey = await generateEphemeralKey();

      // Create agent with current system prompt
      // Per OpenAI API: agent instructions define behavior and personality
      const agent = new RealtimeAgent({
        name: "Assistant",
        instructions: systemPrompt,
      });

      // Get microphone stream with device constraints and audio preprocessing
      // Per Web Audio API best practices: enable echo cancellation, noise suppression, and AGC
      // Use 'ideal' instead of 'exact' to allow fallback to default device if selected device is unavailable
      let micStream: MediaStream;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: selectedMicrophone
            ? {
                deviceId: { ideal: selectedMicrophone },
                echoCancellation: true, // Prevents acoustic feedback
                noiseSuppression: true, // Filters background noise
                autoGainControl: true, // Normalizes volume levels
              }
            : {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
        });
      } catch (error) {
        // If device constraint fails, retry with default device
        if (
          error instanceof DOMException &&
          error.name === "OverconstrainedError"
        ) {
          console.warn(
            "[VoiceAgent] Selected microphone unavailable, falling back to default device"
          );
          micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } else {
          throw error;
        }
      }

      // Store microphone stream reference for cleanup and state for audio level monitoring
      micStreamRef.current = micStream;
      setMicStream(micStream);

      // Mix microphone with system audio if enabled
      let finalStream = micStream;
      if (systemAudioStream) {
        const mixed = await mixAudioStreams(micStream, systemAudioStream);
        finalStream = mixed.stream;
        audioContextRef.current = mixed.audioContext;
        micGainRef.current = mixed.micGain;
        systemAudioGainRef.current = mixed.systemAudioGain;
      }

      // Store references for PTT control
      finalAudioStreamRef.current = finalStream;
      // Sync PTT audio stream ref immediately
      pttAudioStreamRef.current = finalStream;
      if (finalStream !== micStream) {
        setMixedAudioStream(finalStream);
      }

      // Create WebRTC transport with the mixed audio stream
      // Per OpenAI API: WebRTC provides low-latency bidirectional audio streaming
      const transport = new OpenAIRealtimeWebRTC({
        mediaStream: finalStream,
      });

      // Store transport reference for output stream access
      transportRef.current = transport;

      // Create session with custom transport and VAD configuration
      // Per OpenAI API documentation:
      // - model: "gpt-realtime" is the speech-to-speech model
      // - transport: WebRTC transport handles audio streaming (automatically manages audio format)
      // - config.audio.input.turnDetection: VAD configuration (null for PTT/Toggle modes = manual control)
      // For PTT/Toggle modes, turnDetection is null to disable automatic turn ending
      // This allows manual control - user must explicitly end turns
      //
      // Note: Additional config options available (primarily for WebSocket transport):
      // - config.inputAudioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw' (default: 'pcm16')
      // - config.outputAudioFormat: 'pcm16' | 'g711_ulaw' | 'g711_alaw' (default: 'pcm16')
      // - config.inputAudioTranscription: { model: 'gpt-4o-mini-transcribe' }
      // WebRTC transport automatically handles audio format conversion, so these are optional
      const vadConfig = getVadConfig(vadMode, inputMode);
      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
        transport: transport,
        config: {
          audio: {
            input: {
              // Conditionally include turnDetection to avoid destructuring errors
              // When null (PTT/Toggle modes), VAD is disabled and turns won't auto-end
              // Per OpenAI API: turnDetection can be semantic_vad or server_vad config
              ...(vadConfig !== null && { turnDetection: vadConfig }),
            },
          },
        },
      });

      // Connect to OpenAI Realtime API
      // Per OpenAI API: connection establishes WebRTC peer connection
      await session.connect({ apiKey: ephemeralKey });

      // Use existing session ID if available (from loaded session), otherwise generate new one
      const sessionId = currentSessionId || generateSessionId();
      if (!currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      // Set up conversation history listener
      // IMPORTANT: Per OpenAI API docs, the recommended order is:
      //   1. await session.connect({ apiKey: '<client-api-key>' });
      //   2. session.on('history_updated', (history) => { ... });
      //   3. session.updateHistory([...]); // if needed
      // The history_updated listener must be set up BEFORE calling updateHistory()
      // to ensure we capture all history updates, including those triggered by updateHistory()
      // https://openai.github.io/openai-agents-js/ja/guides/voice-agents/build/#%E4%BC%9A%E8%A9%B1%E5%B1%A5%E6%AD%B4%E3%81%AE%E7%AE%A1%E7%90%86
      // https://openai.github.io/openai-agents-js/openai/agents/realtime/classes/realtimesession/
      session.on("history_updated", (history: RealtimeItem[]) => {
        // Log for debugging (only in development)
        if (process.env.NODE_ENV === "development") {
          console.log("[VoiceAgent] History updated:", {
            historyLength: history.length,
            inputMode,
            items: history.map((item, index) => ({
              index,
              type: item.type,
              role: isRealtimeMessageItem(item) ? item.role : undefined,
              status:
                isRealtimeMessageItem(item) &&
                (isUserMessage(item) || isAssistantMessage(item))
                  ? item.status
                  : undefined,
              hasContent: isRealtimeMessageItem(item) ? !!item.content : false,
              contentType: isRealtimeMessageItem(item)
                ? Array.isArray(item.content)
                  ? "array"
                  : typeof item.content
                : undefined,
            })),
          });
        }

        // Update local state with the full history from the session
        // Per OpenAI API docs: history_updated returns the full history of the session
        // We can also access session.history directly, but using the event parameter is more reliable
        setConversationHistory(history);

        // Auto-save to localStorage with current agent config
        // Per OpenAI API: save session after each history update for persistence
        if (sessionId && agentRef.current) {
          saveSession(sessionId, history, {
            name: agentRef.current.name,
            instructions: systemPrompt,
          });

          if (process.env.NODE_ENV === "development") {
            console.log("[VoiceAgent] Auto-saved session:", {
              historyLength: history.length,
              sessionId,
            });
          }
        }
        // Auto-scroll is handled by ConversationHistory component
      });

      // Set up speech detection listeners for visual feedback
      // Per OpenAI API: these events are fired by VAD when user speech is detected
      // Note: These events may not be in the TypeScript type definitions yet,
      // but they are documented in the OpenAI Realtime API and work at runtime
      // Type assertion is used here to access these events until types are updated
      (session as any).on("input_audio_buffer.speech_started", () => {
        setIsListening(true);
      });

      (session as any).on("input_audio_buffer.speech_stopped", () => {
        setIsListening(false);
      });

      // Set up AI speech listeners for feedback loop prevention
      // Per OpenAI API: audio_start/audio_stopped/audio_interrupted events track AI speech lifecycle
      session.on("audio_start", () => {
        console.log("[Feedback Prevention] AI started speaking");
        setIsAISpeaking(true);

        // Mute system audio during AI speech to prevent feedback loop
        if (systemAudioGainRef.current) {
          systemAudioGainRef.current.gain.value = 0;
        }
      });

      session.on("audio_stopped", () => {
        console.log("[Feedback Prevention] AI stopped speaking");
        setIsAISpeaking(false);

        // Restore system audio after AI finishes
        if (systemAudioGainRef.current) {
          systemAudioGainRef.current.gain.value = 0.7;
        }
      });

      session.on("audio_interrupted", () => {
        console.log("[Feedback Prevention] AI interrupted");
        setIsAISpeaking(false);

        // Restore system audio on interruption
        if (systemAudioGainRef.current) {
          systemAudioGainRef.current.gain.value = 0.7;
        }
      });

      // Set up error listener for session errors
      // Per OpenAI API docs: session.on("error") handles connection and runtime errors
      // Error handling follows OpenAI Realtime API error format patterns
      session.on("error", (error: unknown) => {
        // Log detailed error information for debugging (development only)
        if (process.env.NODE_ENV === "development") {
          const errorDetails: Record<string, unknown> = {
            error,
            errorType: typeof error,
            errorString: String(error),
            isError: error instanceof Error,
          };

          if (error && typeof error === "object") {
            errorDetails.errorConstructor = (
              error as { constructor?: { name?: string } }
            ).constructor?.name;
            try {
              errorDetails.errorJSON = JSON.stringify(error, null, 2);
            } catch {
              errorDetails.errorJSON = "[Unable to stringify error]";
            }
          }

          if (error instanceof Error) {
            errorDetails.errorStack = error.stack;
            errorDetails.errorName = error.name;
          }

          console.error("[VoiceAgent] Session error:", errorDetails);
        }

        // Extract error message from various error formats
        // Per OpenAI Realtime API: errors can be nested structures like error.error.error.message
        // Also handles standard Error objects, string errors, and API error responses
        let errorMessage = "An unknown session error occurred";

        if (error instanceof Error) {
          // Standard Error object - use message or name
          errorMessage = error.message || error.name || errorMessage;
        } else if (typeof error === "string") {
          // String error - use directly
          errorMessage = error;
        } else if (error && typeof error === "object") {
          // Handle error objects that might have message, error, or other properties
          const errorObj = error as Record<string, unknown>;

          // Check for nested error structure (OpenAI Realtime API format)
          // Common patterns: error.error.error.message, error.error.message, error.message
          let nestedError = errorObj;
          let depth = 0;
          const maxDepth = 3; // Prevent infinite loops

          while (
            depth < maxDepth &&
            nestedError.error &&
            typeof nestedError.error === "object"
          ) {
            nestedError = nestedError.error as Record<string, unknown>;
            depth++;
          }

          // Try to extract message from various possible locations
          const message =
            (nestedError.message as string) ||
            (errorObj.message as string) ||
            (errorObj.error as string) ||
            (errorObj.reason as string) ||
            (nestedError.code as string) ||
            (errorObj.code as string) ||
            (nestedError.type as string) ||
            (errorObj.type as string);

          if (message && typeof message === "string") {
            errorMessage = message;
          } else {
            // Check if object has any properties that might be useful
            const keys = Object.keys(errorObj);
            if (keys.length > 0) {
              // Try to stringify, but provide fallback for empty objects
              try {
                const stringified = JSON.stringify(errorObj);
                if (stringified !== "{}") {
                  errorMessage = stringified;
                }
              } catch {
                // If stringification fails, use default message
              }
            }
          }
        } else if (error !== null && error !== undefined) {
          // Fallback: convert to string
          errorMessage = String(error);
        }

        setError(errorMessage);
        // Don't automatically disconnect on error - let user decide
        // Some errors may be recoverable (e.g., temporary network issues)
        // Critical errors that require disconnection should be handled separately
      });

      // Store references
      agentRef.current = agent;
      sessionRef.current = session;

      // Load initial history if provided (session restoration)
      // Per OpenAI API: updateHistory() must be called AFTER setting up history_updated listener
      // This ensures we capture all history updates including those from restoration
      if (initialHistory && initialHistory.length > 0) {
        // Prepare history for restoration: convert audio content to text content
        // Per OpenAI API: updateHistory() does not accept output_audio, only text content
        const validatedHistory = prepareHistoryForRestore(initialHistory);

        if (validatedHistory.length > 0) {
          try {
            // Debug: Log detailed history structure before sending to API
            if (process.env.NODE_ENV === "development") {
              console.log("[VoiceAgent] About to load history:", {
                originalLength: initialHistory.length,
                validatedLength: validatedHistory.length,
                sessionId,
                items: validatedHistory.map((item, index) => ({
                  index,
                  type: item.type,
                  role: isRealtimeMessageItem(item) ? item.role : undefined,
                  contentLength:
                    isRealtimeMessageItem(item) && Array.isArray(item.content)
                      ? item.content.length
                      : 0,
                  contentTypes:
                    isRealtimeMessageItem(item) && Array.isArray(item.content)
                      ? item.content.map((c: any) => ({
                          type: c.type,
                          hasText: "text" in c,
                          hasTranscript: "transcript" in c,
                          hasAudio: "audio" in c,
                          textValue: c.text
                            ? c.text.substring(0, 50)
                            : undefined,
                          transcriptValue: c.transcript
                            ? c.transcript.substring(0, 50)
                            : undefined,
                        }))
                      : undefined,
                })),
              });
            }

            // Call updateHistory to restore conversation context
            // Per OpenAI API: this loads the history into the session for context
            await session.updateHistory(validatedHistory);

            if (process.env.NODE_ENV === "development") {
              console.log("[VoiceAgent] Loaded session history successfully:", {
                originalLength: initialHistory.length,
                validatedLength: validatedHistory.length,
                sessionId,
              });
            }
          } catch (error) {
            console.error("[VoiceAgent] Error loading history:", error);

            // Debug: Log the full validated history on error
            if (process.env.NODE_ENV === "development") {
              console.error(
                "[VoiceAgent] Failed history data:",
                JSON.stringify(validatedHistory, null, 2)
              );
            }

            setError(
              "Failed to load session history. Starting fresh conversation."
            );
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn("[VoiceAgent] No valid history items to load");
          }
        }
      }

      // Initialize PTT state: disable tracks for PTT/Toggle modes on connection
      // This ensures tracks are disabled before connection is marked as complete
      if (inputMode !== "always_on" && finalAudioStreamRef.current) {
        const audioTracks = finalAudioStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = false;
        });
        console.log(
          "[PTT] Initialized with tracks disabled for PTT/Toggle mode"
        );
      }

      // Ensure PTT audio stream ref is synced before setting connected state
      // This ensures usePTT hook can control the tracks immediately
      pttAudioStreamRef.current = finalAudioStreamRef.current;

      // Reset PTT state to inactive on connection
      // This ensures PTT/Toggle modes start with microphone disabled
      if (inputMode !== "always_on") {
        setIsPTTActive(false);
        console.log("[PTT] Reset PTT state to inactive on connection");
      }

      setIsConnected(true);
      setIsConnecting(false);
      console.log("You are connected!");
    } catch (error) {
      console.error("Connection error:", error);
      setError(error instanceof Error ? error.message : "Connection failed");
      setIsConnecting(false);
    }
  };

  // Clear conversation history
  // Per OpenAI API: clears both local state and API session context
  const clearHistory = async () => {
    // Clear API session history if connected
    // Per OpenAI API: updateHistory([]) clears the session history
    if (sessionRef.current && isConnected) {
      try {
        await sessionRef.current.updateHistory([]);
        console.log("[VoiceAgent] Cleared session history in API");
      } catch (error) {
        console.error("[VoiceAgent] Error clearing API history:", error);
      }
    }

    // Clear local state
    setConversationHistory([]);

    // Clear saved session from localStorage
    if (currentSessionId) {
      deleteSession(currentSessionId);
      setCurrentSessionId(null);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[VoiceAgent] Cleared conversation history");
    }
  };

  // Load a saved session
  // Per OpenAI API: disconnect, restore config, and reconnect with history
  const handleLoadSession = async (session: SavedSession) => {
    try {
      // Disconnect current session if connected
      if (isConnected) {
        await disconnect();
      }

      // Set the session ID for the loaded session
      setCurrentSessionId(session.id);

      // Restore agent config if saved
      if (session.agentConfig) {
        const agentInstructions = session.agentConfig.instructions;
        setSystemPrompt(agentInstructions);
        // Find matching template if exists
        const matchingTemplate = SYSTEM_PROMPT_TEMPLATES.find(
          (t) => t.prompt === agentInstructions
        );
        if (matchingTemplate) {
          setSelectedTemplateId(matchingTemplate.id);
        }
      }

      // Connect with the loaded history
      // Per OpenAI API: connect() with initialHistory will call updateHistory()
      await connect(session.history);

      if (process.env.NODE_ENV === "development") {
        console.log("[VoiceAgent] Loaded session:", {
          sessionId: session.id,
          historyLength: session.history.length,
          messageCount: session.messageCount,
        });
      }
    } catch (error) {
      console.error("[VoiceAgent] Error loading session:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load session"
      );
    }
  };

  // Handle sending text message
  const handleSendMessage = async (message: string) => {
    if (!sessionRef.current || !isConnected) {
      throw new Error("Not connected to session");
    }

    if (!message.trim()) {
      return;
    }

    try {
      sessionRef.current.sendMessage(message);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  // Handle manual interruption of AI speech
  // Per OpenAI API docs: session.interrupt() manually interrupts AI speech generation
  // This will trigger the audio_interrupted event, which is already handled above
  // https://openai.github.io/openai-agents-js/ja/guides/voice-agents/build/#%E5%89%B2%E3%82%8A%E8%BE%BC%E3%81%BF
  const handleInterrupt = () => {
    if (!sessionRef.current || !isConnected) {
      return;
    }

    try {
      // Per OpenAI API: interrupt() stops AI speech generation and triggers audio_interrupted event
      // The audio_interrupted event handler will update state and restore system audio
      sessionRef.current.interrupt();
      console.log("[VoiceAgent] Manually interrupted AI speech");
    } catch (error) {
      console.error("Error interrupting AI speech:", error);
      setError("Failed to interrupt AI speech");
    }
  };

  // Update system prompt
  // Per OpenAI API docs: use session.updateAgent() to update agent configuration during active session
  const updateSystemPrompt = () => {
    setSystemPrompt(tempPrompt);
    setIsPromptDialogOpen(false);

    // If connected, update the agent's instructions using updateAgent() method
    // Per OpenAI API: updateAgent() updates the agent configuration for the active session
    if (sessionRef.current && agentRef.current && isConnected) {
      try {
        // Create updated agent with new instructions
        const updatedAgent = new RealtimeAgent({
          name: agentRef.current.name,
          instructions: tempPrompt,
        });

        // Update agent in session using official API method
        sessionRef.current.updateAgent(updatedAgent);

        // Update local agent reference
        agentRef.current = updatedAgent;

        if (process.env.NODE_ENV === "development") {
          console.log("[VoiceAgent] Agent updated via updateAgent():", {
            name: updatedAgent.name,
            instructionsLength: updatedAgent.instructions.length,
          });
        }
      } catch (error) {
        console.error("Error updating agent via updateAgent():", error);
        setError("Failed to update system prompt");
      }
    }
  };

  // Open prompt dialog
  const openPromptDialog = () => {
    setTempPrompt(systemPrompt);
    // Try to find matching template
    const matchingTemplate = SYSTEM_PROMPT_TEMPLATES.find(
      (template) => template.prompt === systemPrompt
    );
    if (matchingTemplate) {
      setSelectedTemplateId(matchingTemplate.id);
    } else {
      setSelectedTemplateId("default");
    }
    setIsPromptDialogOpen(true);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = SYSTEM_PROMPT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setSystemPrompt(template.prompt);
      // Update input mode based on template recommendation
      setInputMode(template.recommendedInputMode);
    }
  };

  // Disconnect from Realtime API
  // Per OpenAI API docs: session.close() closes the connection and cleans up resources
  const disconnect = async () => {
    // Save final state before disconnecting
    // Per best practices: persist session state before cleanup
    if (
      currentSessionId &&
      sessionRef.current &&
      conversationHistory.length > 0
    ) {
      try {
        saveSession(
          currentSessionId,
          conversationHistory,
          agentRef.current
            ? {
                name: agentRef.current.name,
                instructions: systemPrompt,
              }
            : undefined
        );

        if (process.env.NODE_ENV === "development") {
          console.log(
            "[VoiceAgent] Saved final session state before disconnect:",
            {
              sessionId: currentSessionId,
              historyLength: conversationHistory.length,
            }
          );
        }
      } catch (error) {
        console.error("[VoiceAgent] Error saving final state:", error);
      }
    }

    if (sessionRef.current) {
      try {
        // Note: close() method may not be in TypeScript type definitions yet,
        // but it's available in the SDK. Type assertion is used until types are updated
        await (sessionRef.current as any).close?.();
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    }

    // Clean up audio resources
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setMicStream(null);

    if (mixedAudioStream) {
      mixedAudioStream.getTracks().forEach((track) => track.stop());
      setMixedAudioStream(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    sessionRef.current = null;
    agentRef.current = null;
    finalAudioStreamRef.current = null;
    transportRef.current = null;
    setIsConnected(false);
    setIsListening(false);
    setIsPTTActive(false);
    setConversationHistory([]);
    setCurrentSessionId(null);
  };

  // Load audio devices on mount
  useEffect(() => {
    enumerateAudioDevices();
  }, []);

  // Test microphone function
  const startMicrophoneTest = async () => {
    console.log(
      "[Microphone Test] Button clicked, isTestingMicrophone:",
      isTestingMicrophone
    );

    if (isTestingMicrophone) {
      // Stop testing
      console.log("[Microphone Test] Stopping test...");
      if (testMicStreamRef.current) {
        testMicStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          console.log("[Microphone Test] Track stopped:", track.id);
        });
        testMicStreamRef.current = null;
      }
      setTestMicStream(null);
      setIsTestingMicrophone(false);
      console.log("[Microphone Test] Test stopped");
      return;
    }

    console.log(
      "[Microphone Test] Starting test, selectedMicrophone:",
      selectedMicrophone
    );

    try {
      // Use 'ideal' instead of 'exact' for better compatibility
      // If the exact device is not available, it will fall back to default
      const constraints = selectedMicrophone
        ? {
            deviceId: { ideal: selectedMicrophone },
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        : {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          };

      console.log(
        "[Microphone Test] Requesting media with constraints:",
        constraints
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints,
      });

      console.log(
        "[Microphone Test] Stream obtained:",
        stream.id,
        "Tracks:",
        stream.getAudioTracks().length
      );

      testMicStreamRef.current = stream;
      setTestMicStream(stream);
      setIsTestingMicrophone(true);

      console.log(
        "[Microphone Test] Test started successfully, isTestingMicrophone set to true"
      );
    } catch (error) {
      console.error("[Microphone Test] Error testing microphone:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to access microphone for testing";
      setError(errorMessage);
      setIsTestingMicrophone(false);
      setTestMicStream(null);
    }
  };

  // Cleanup test stream when dialog closes or microphone changes
  useEffect(() => {
    if (!isAudioDialogOpen && testMicStreamRef.current) {
      testMicStreamRef.current.getTracks().forEach((track) => track.stop());
      testMicStreamRef.current = null;
      setTestMicStream(null);
      setIsTestingMicrophone(false);
    }
  }, [isAudioDialogOpen]);

  useEffect(() => {
    // Stop test if microphone changes while testing
    // Only trigger when selectedMicrophone actually changes, not when isTestingMicrophone changes
    if (isTestingMicrophone && testMicStreamRef.current) {
      console.log("[Microphone Test] Microphone changed, stopping test");
      testMicStreamRef.current.getTracks().forEach((track) => track.stop());
      testMicStreamRef.current = null;
      setTestMicStream(null);
      setIsTestingMicrophone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMicrophone]); // Only depend on selectedMicrophone, not isTestingMicrophone

  // Cleanup on unmount
  // Remove all event listeners and close session connection
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try {
          // Note: close() method may not be in TypeScript type definitions yet,
          // but it's available in the SDK. Type assertion is used until types are updated
          (sessionRef.current as any).close?.();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      }

      // Clean up system audio
      if (systemAudioStream) {
        systemAudioStream.getTracks().forEach((track) => track.stop());
      }

      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      // Clean up test microphone stream
      if (testMicStreamRef.current) {
        testMicStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [systemAudioStream]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          {/* Connection Status */}
          <ConnectionStatus
            isConnected={isConnected}
            isConnecting={isConnecting}
            isListening={isListening}
            isAISpeaking={isAISpeaking}
            isPTTActive={isPTTActive}
            inputMode={inputMode}
            systemAudioEnabled={systemAudioEnabled}
            inputAudioLevel={inputAudioLevel}
            onAudioSettingsClick={() => setIsAudioDialogOpen(true)}
            onSystemPromptClick={openPromptDialog}
            onViewSessions={() => setIsSessionHistoryDialogOpen(true)}
            onInputModeChange={setInputMode}
            onConnect={connect}
            onDisconnect={disconnect}
            onInterrupt={handleInterrupt}
            templates={SYSTEM_PROMPT_TEMPLATES}
            selectedTemplateId={selectedTemplateId}
            onTemplateSelect={handleTemplateSelect}
          />

          {/* Error Display */}
          {error && (
            <ErrorAlert
              error={error}
              onDismiss={() => setError(null)}
              onRetrySystemAudio={() => {
                setError(null);
                captureSystemAudio();
              }}
              onRefreshDevices={() => {
                setError(null);
                enumerateAudioDevices();
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* System Prompt Display (Separate from conversation history) */}
      {isConnected && systemPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("conversation.systemPromptTitle")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={openPromptDialog}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                {t("common.edit")}
              </Button>
            </div>
            <CardDescription>
              {t("conversation.systemPromptDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full border rounded-md bg-muted">
              <div className="p-4">
                <pre className="text-sm font-mono whitespace-pre-wrap break-words text-foreground/90">
                  {systemPrompt}
                </pre>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Conversation History */}
      <ConversationHistory
        history={conversationHistory}
        isConnected={isConnected}
        onClearHistory={clearHistory}
      />

      {/* Text Input */}
      {isConnected && (
        <TextInput
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* System Prompt Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("systemPrompt.title")}</DialogTitle>
            <DialogDescription>
              {t("systemPrompt.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label
                htmlFor="template-select"
                className="text-sm font-medium mb-2 block"
              >
                {t("systemPrompt.templateLabel")}
              </label>
              <Select
                value={selectedTemplateId}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger id="template-select" className="w-full">
                  <SelectValue
                    placeholder={t("systemPrompt.templatePlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(() => {
                const selectedTemplate = SYSTEM_PROMPT_TEMPLATES.find(
                  (t) => t.id === selectedTemplateId
                );
                if (selectedTemplate) {
                  return (
                    <div className="mt-2 p-3 rounded-lg bg-muted text-sm">
                      <p className="font-medium mb-1">
                        {selectedTemplate.description}
                      </p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>
                          <strong>
                            {t("systemPrompt.recommendedInputMode")}:
                          </strong>{" "}
                          {t(
                            `inputMode.${selectedTemplate.recommendedInputMode}`
                          )}
                        </p>
                        <p>
                          <strong>
                            {t("systemPrompt.recommendedAudioSource")}:
                          </strong>{" "}
                          {t(
                            `audioSource.${selectedTemplate.recommendedAudioSource}`
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Prompt Textarea */}
            <div>
              <label htmlFor="system-prompt" className="text-sm font-medium">
                {t("systemPrompt.label")}
              </label>
              <Textarea
                id="system-prompt"
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder={t("systemPrompt.placeholder")}
                className="mt-2 min-h-[300px] font-mono text-sm"
              />
            </div>

            {/* Template Info */}
            {(() => {
              const selectedTemplate = SYSTEM_PROMPT_TEMPLATES.find(
                (t) => t.id === selectedTemplateId
              );
              if (selectedTemplate && selectedTemplate.whenToUse.length > 0) {
                return (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium mb-1">
                        {t("systemPrompt.whenToUse")}
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {selectedTemplate.whenToUse.map((use, index) => (
                          <li key={index}>{use}</li>
                        ))}
                      </ul>
                    </div>
                    {selectedTemplate.notes.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium mb-1">
                          {t("systemPrompt.notes")}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {selectedTemplate.notes.map((note, index) => (
                            <li key={index}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* General Tips */}
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>{t("systemPrompt.tips")}</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>{t("systemPrompt.tip1")}</li>
                <li>{t("systemPrompt.tip2")}</li>
                <li>{t("systemPrompt.tip3")}</li>
                <li>{t("systemPrompt.tip4")}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromptDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={updateSystemPrompt}>
              {t("systemPrompt.updateButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio Settings Dialog */}
      <Dialog open={isAudioDialogOpen} onOpenChange={setIsAudioDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              {t("audio.settings")}
            </DialogTitle>
            <DialogDescription>
              {t("audio.voiceDetection.description")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Audio Devices Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("audio.devices.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("audio.devices.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Microphone Selection */}
                <div>
                  <label
                    htmlFor="microphone-select"
                    className="text-sm font-medium flex items-center gap-2 mb-2"
                  >
                    <Mic className="h-4 w-4" />
                    {t("audio.devices.microphone")}
                  </label>
                  <div className="space-y-2">
                    <Select
                      value={selectedMicrophone}
                      onValueChange={setSelectedMicrophone}
                      disabled={isLoadingDevices || isTestingMicrophone}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("audio.devices.selectMicrophone")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices.microphones.map((device) => (
                          <SelectItem
                            key={device.deviceId}
                            value={device.deviceId}
                          >
                            {device.label ||
                              `Microphone ${device.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Microphone Test */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          console.log(
                            "[Microphone Test] Button onClick triggered, isTestingMicrophone:",
                            isTestingMicrophone
                          );
                          startMicrophoneTest();
                        }}
                        disabled={!selectedMicrophone || isLoadingDevices}
                        className="gap-2 flex-1"
                      >
                        {isTestingMicrophone ? (
                          <>
                            <Square className="h-3.5 w-3.5" />
                            {t("audio.devices.stopTest")}
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            {t("audio.devices.testMicrophone")}
                          </>
                        )}
                      </Button>
                      {isTestingMicrophone && (
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{t("audio.devices.audioLevel")}</span>
                            <span>{Math.round(testMicAudioLevel)}%</span>
                          </div>
                          <Progress value={testMicAudioLevel} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Speaker Selection */}
                <div>
                  <label
                    htmlFor="speaker-select"
                    className="text-sm font-medium flex items-center gap-2 mb-2"
                  >
                    <Speaker className="h-4 w-4" />
                    {t("audio.devices.speaker")}
                  </label>
                  <Select
                    value={selectedSpeaker}
                    onValueChange={setSelectedSpeaker}
                    disabled={isLoadingDevices}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("audio.devices.selectSpeaker")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.speakers.map((device) => (
                        <SelectItem
                          key={device.deviceId}
                          value={device.deviceId}
                        >
                          {device.label ||
                            `Speaker ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Device Count and Refresh */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    {t("audio.devices.deviceCount", {
                      micCount: audioDevices.microphones.length,
                      speakerCount: audioDevices.speakers.length,
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enumerateAudioDevices}
                    disabled={isLoadingDevices}
                    className="gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isLoadingDevices ? "animate-spin" : ""
                      }`}
                    />
                    {t("common.refresh")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Voice Detection Settings Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("audio.voiceDetection.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("audio.voiceDetection.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* VAD Settings */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    {t("audio.voiceDetection.sensitivity")}
                  </label>
                  <Select
                    value={vadMode}
                    onValueChange={(value: VadMode) => setVadMode(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">
                        {t("audio.voiceDetection.conservative")}
                      </SelectItem>
                      <SelectItem value="balanced">
                        {t("audio.voiceDetection.balanced")}
                      </SelectItem>
                      <SelectItem value="responsive">
                        {t("audio.voiceDetection.responsive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      <strong>
                        {t("audio.voiceDetection.conservative").split(" ")[0]}:
                      </strong>{" "}
                      {t("audio.voiceDetection.conservativeDesc")}
                    </div>
                    <div>
                      <strong>{t("audio.voiceDetection.balanced")}:</strong>{" "}
                      {t("audio.voiceDetection.balancedDesc")}
                    </div>
                    <div>
                      <strong>{t("audio.voiceDetection.responsive")}:</strong>{" "}
                      {t("audio.voiceDetection.responsiveDesc")}
                    </div>
                  </div>
                </div>

                {/* Input Mode */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4" />
                    {t("audio.voiceDetection.inputMode")}
                  </label>
                  <Select
                    value={inputMode}
                    onValueChange={(value: InputMode) => setInputMode(value)}
                    disabled={isConnected}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always_on">
                        {t("audio.voiceDetection.alwaysOn")}
                      </SelectItem>
                      <SelectItem value="push_to_talk">
                        {t("audio.voiceDetection.pushToTalk")}
                      </SelectItem>
                      <SelectItem value="toggle">
                        {t("audio.voiceDetection.toggle")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      <strong>{t("connection.inputMode.alwaysOn")}:</strong>{" "}
                      {t("audio.voiceDetection.alwaysOnDesc")}
                    </div>
                    <div>
                      <strong>{t("connection.inputMode.pushToTalk")}:</strong>{" "}
                      {t("audio.voiceDetection.pushToTalkDesc")}
                    </div>
                    <div>
                      <strong>{t("connection.inputMode.toggle")}:</strong>{" "}
                      {t("audio.voiceDetection.toggleDesc")}
                    </div>
                    {inputMode !== "always_on" && (
                      <div className="pt-1 text-gray-600 dark:text-gray-400 font-medium">
                        {t("audio.voiceDetection.inputModeWarning")}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Audio Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("audio.systemAudio.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("audio.systemAudio.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {systemAudioEnabled ? (
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                        <span className="h-2 w-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse" />
                        {t("audio.systemAudio.capturing")}
                      </span>
                    ) : (
                      t("audio.systemAudio.captureDescription")
                    )}
                  </div>
                  <Button
                    variant={systemAudioEnabled ? "destructive" : "default"}
                    size="sm"
                    onClick={
                      systemAudioEnabled ? stopSystemAudio : captureSystemAudio
                    }
                    className="gap-2"
                  >
                    {systemAudioEnabled ? (
                      <>
                        <PhoneOff className="h-4 w-4" />
                        {t("common.stop")}
                      </>
                    ) : (
                      <>
                        <Monitor className="h-4 w-4" />
                        {t("common.start")}
                      </>
                    )}
                  </Button>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs space-y-2">
                    <div>
                      <strong>{t("audio.systemAudio.quickSetup")}</strong>
                      <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                        <li>{t("audio.systemAudio.quickSetupStep1")}</li>
                        <li>{t("audio.systemAudio.quickSetupStep2")}</li>
                        <li>
                          <strong className="text-gray-600 dark:text-gray-400">
                            {t("audio.systemAudio.quickSetupStep3")}
                          </strong>
                        </li>
                        <li>{t("audio.systemAudio.quickSetupStep4")}</li>
                      </ol>
                    </div>
                    <div className="pt-2 border-t">
                      <strong>{t("audio.systemAudio.note")}</strong>{" "}
                      {t("audio.systemAudio.noteText")}
                    </div>
                    <div className="pt-2 border-t">
                      <strong>{t("audio.systemAudio.browserSupport")}</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        <li>{t("audio.systemAudio.browserChrome")}</li>
                        <li>{t("audio.systemAudio.browserFirefox")}</li>
                        <li>{t("audio.systemAudio.browserSafari")}</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Advanced Information (Collapsible) */}
            <div className="border rounded-lg">
              <button
                type="button"
                onClick={() => setShowAdvancedInfo(!showAdvancedInfo)}
                className="w-full flex items-center justify-between p-4 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  {t("audio.advanced.title")}
                </span>
                {showAdvancedInfo ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {showAdvancedInfo && (
                <div className="p-4 pt-0 space-y-3 text-sm text-muted-foreground border-t">
                  <div>
                    <p className="font-medium mb-1 text-foreground">
                      {t("audio.advanced.virtualAudioCables")}
                    </p>
                    <p className="text-xs">
                      {t("audio.advanced.virtualAudioCablesDesc")}
                    </p>
                    <ul className="list-disc list-inside ml-2 mt-1 text-xs">
                      <li>{t("audio.advanced.virtualAudioWindows")}</li>
                      <li>{t("audio.advanced.virtualAudioMac")}</li>
                      <li>{t("audio.advanced.virtualAudioLinux")}</li>
                    </ul>
                    <p className="text-xs mt-1">
                      {t("audio.advanced.virtualAudioNote")}
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1 text-foreground">
                      {t("audio.advanced.deviceSelection")}
                    </p>
                    <p className="text-xs">
                      {t("audio.advanced.deviceSelectionDesc")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsAudioDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("common.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session History Dialog */}
      <SessionHistoryList
        open={isSessionHistoryDialogOpen}
        onOpenChange={setIsSessionHistoryDialogOpen}
        onLoadSession={handleLoadSession}
      />
    </div>
  );
}
