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

export default function VoiceAgent() {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Conversation state
  const [conversationHistory, setConversationHistory] = useState<
    RealtimeItem[]
  >([]);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [tempPrompt, setTempPrompt] = useState("");
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false);

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

  // Sync PTT audio stream ref with final audio stream ref
  useEffect(() => {
    pttAudioStreamRef.current = finalAudioStreamRef.current;
  }, [pttAudioStreamRef]);

  // Handle system audio errors
  useEffect(() => {
    if (systemAudioHook.error) {
      setError(systemAudioHook.error);
    }
  }, [systemAudioHook.error]);

  // Connect to Realtime API
  const connect = async () => {
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      const ephemeralKey = await generateEphemeralKey();

      // Create agent with current system prompt
      const agent = new RealtimeAgent({
        name: "Assistant",
        instructions: systemPrompt,
      });

      // Get microphone stream with device constraints and audio preprocessing
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicrophone
          ? {
              deviceId: { exact: selectedMicrophone },
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
      });

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
      if (finalStream !== micStream) {
        setMixedAudioStream(finalStream);
      }

      // Create custom WebRTC transport with the mixed audio stream
      const transport = new OpenAIRealtimeWebRTC({
        mediaStream: finalStream,
      });

      // Store transport reference for output stream access
      transportRef.current = transport;

      // Create session with custom transport and VAD configuration
      // PTT/Toggle modes disable automatic turn detection
      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
        transport: transport,
        config: {
          audio: {
            input: {
              // Only include turnDetection when in always_on mode
              // Omitting it entirely disables VAD for PTT/Toggle modes
              ...(inputMode === "always_on" && {
                turnDetection: getVadConfig(vadMode),
              }),
            },
          },
        },
      });

      await session.connect({ apiKey: ephemeralKey });

      // Set up conversation history listener
      session.on("history_updated", (history: RealtimeItem[]) => {
        setConversationHistory(history);
        // Auto-scroll is handled by ConversationHistory component
      });

      // Set up speech detection listeners for visual feedback
      (session as any).on("input_audio_buffer.speech_started", () => {
        setIsListening(true);
      });

      (session as any).on("input_audio_buffer.speech_stopped", () => {
        setIsListening(false);
      });

      // Set up AI speech listeners for feedback loop prevention
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

      // Store references
      agentRef.current = agent;
      sessionRef.current = session;

      // Initialize PTT state: disable tracks for PTT/Toggle modes on connection
      if (inputMode !== "always_on" && finalAudioStreamRef.current) {
        const audioTracks = finalAudioStreamRef.current.getAudioTracks();
        audioTracks.forEach((track) => {
          track.enabled = false;
        });
        console.log(
          "[PTT] Initialized with tracks disabled for PTT/Toggle mode"
        );
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
  const clearHistory = () => {
    setConversationHistory([]);
    if (sessionRef.current) {
      try {
        sessionRef.current.updateHistory([]);
      } catch (error) {
        console.error("Error clearing history:", error);
      }
    }
  };

  // Update system prompt
  const updateSystemPrompt = () => {
    setSystemPrompt(tempPrompt);
    setIsPromptDialogOpen(false);

    // If connected, update the agent's instructions
    if (agentRef.current && isConnected) {
      try {
        agentRef.current.instructions = tempPrompt;
        console.log("System prompt updated:", tempPrompt);
      } catch (error) {
        console.error("Error updating system prompt:", error);
        setError("Failed to update system prompt");
      }
    }
  };

  // Open prompt dialog
  const openPromptDialog = () => {
    setTempPrompt(systemPrompt);
    setIsPromptDialogOpen(true);
  };

  // Disconnect from Realtime API
  const disconnect = async () => {
    if (sessionRef.current) {
      try {
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
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        try {
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
            onInputModeChange={setInputMode}
            onConnect={connect}
            onDisconnect={disconnect}
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

      {/* Conversation History */}
      <ConversationHistory
        history={conversationHistory}
        isConnected={isConnected}
        onClearHistory={clearHistory}
      />

      {/* System Prompt Dialog */}
      <Dialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit System Prompt</DialogTitle>
            <DialogDescription>
              Customize the AI assistant's behavior and personality by editing
              the system prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="system-prompt" className="text-sm font-medium">
                System Prompt
              </label>
              <Textarea
                id="system-prompt"
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                placeholder="Enter the system prompt for the AI assistant..."
                className="mt-2 min-h-[200px]"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Tips:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Be specific about the assistant's role and personality</li>
                <li>Include any constraints or guidelines</li>
                <li>Specify the tone and communication style</li>
                <li>Add any domain-specific knowledge or context</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPromptDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={updateSystemPrompt}>Update System Prompt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audio Settings Dialog */}
      <Dialog open={isAudioDialogOpen} onOpenChange={setIsAudioDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Settings
            </DialogTitle>
            <DialogDescription>
              Configure your audio devices and voice detection settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Audio Devices Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Audio Devices</CardTitle>
                <CardDescription className="text-xs">
                  Select your microphone and speaker
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
                    Microphone
                  </label>
                  <div className="space-y-2">
                    <Select
                      value={selectedMicrophone}
                      onValueChange={setSelectedMicrophone}
                      disabled={isLoadingDevices || isTestingMicrophone}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select microphone..." />
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
                            Stop Test
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            Test Microphone
                          </>
                        )}
                      </Button>
                      {isTestingMicrophone && (
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Audio Level</span>
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
                    Speaker
                  </label>
                  <Select
                    value={selectedSpeaker}
                    onValueChange={setSelectedSpeaker}
                    disabled={isLoadingDevices}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select speaker..." />
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
                    {audioDevices.microphones.length} microphone(s),{" "}
                    {audioDevices.speakers.length} speaker(s)
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
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Voice Detection Settings Section */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Voice Detection</CardTitle>
                <CardDescription className="text-xs">
                  Configure how the AI detects when you're speaking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* VAD Settings */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4" />
                    Sensitivity
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
                        Conservative (Recommended)
                      </SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="responsive">Responsive</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      <strong>Conservative:</strong> Waits for you to finish
                      speaking. Reduces unwanted responses.
                    </div>
                    <div>
                      <strong>Balanced:</strong> Moderate sensitivity with 800ms
                      silence detection.
                    </div>
                    <div>
                      <strong>Responsive:</strong> Fast responses, may interrupt
                      occasionally.
                    </div>
                  </div>
                </div>

                {/* Input Mode */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4" />
                    Input Mode
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
                        Always On (Auto VAD)
                      </SelectItem>
                      <SelectItem value="push_to_talk">
                        Push to Talk (Space Key)
                      </SelectItem>
                      <SelectItem value="toggle">Toggle (Space Key)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <div>
                      <strong>Always On:</strong> Automatic voice detection. AI
                      responds when you stop speaking.
                    </div>
                    <div>
                      <strong>Push to Talk:</strong> Hold Space key to transmit.
                      Best for preventing unwanted responses.
                    </div>
                    <div>
                      <strong>Toggle:</strong> Press Space to start/stop
                      transmission. Like a walkie-talkie.
                    </div>
                    {inputMode !== "always_on" && (
                      <div className="pt-1 text-gray-600 dark:text-gray-400 font-medium">
                        ⚠️ Input mode must be set before connecting
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
                  System Audio Capture
                </CardTitle>
                <CardDescription className="text-xs">
                  Capture audio from other applications (Zoom, Teams, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {systemAudioEnabled ? (
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                        <span className="h-2 w-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse" />
                        Capturing system audio
                      </span>
                    ) : (
                      "Capture audio from apps (Zoom, Teams, etc.)"
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
                        Stop
                      </>
                    ) : (
                      <>
                        <Monitor className="h-4 w-4" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs space-y-2">
                    <div>
                      <strong>Quick Setup:</strong>
                      <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                        <li>Click "Start" button above</li>
                        <li>Select the tab/window with audio</li>
                        <li>
                          <strong className="text-gray-600 dark:text-gray-400">
                            ✓ Check "Share system audio" or "Share tab audio"
                          </strong>
                        </li>
                        <li>Click "Share" to start capturing</li>
                      </ol>
                    </div>
                    <div className="pt-2 border-t">
                      <strong>Note:</strong> System audio capture is{" "}
                      <strong className="text-gray-600 dark:text-gray-400">
                        optional
                      </strong>
                      . The voice agent works with your microphone only if
                      system audio isn't available.
                    </div>
                    <div className="pt-2 border-t">
                      <strong>Browser Support:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        <li>✅ Chrome/Edge: Full support</li>
                        <li>⚠️ Firefox: Limited support</li>
                        <li>❌ Safari: Not supported</li>
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
                  Advanced Information
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
                      Virtual Audio Cables
                    </p>
                    <p className="text-xs">
                      For better control over system audio routing, install
                      virtual audio software:
                    </p>
                    <ul className="list-disc list-inside ml-2 mt-1 text-xs">
                      <li>Windows: VB-Cable, VoiceMeeter</li>
                      <li>macOS: BlackHole, Loopback</li>
                      <li>Linux: PulseAudio virtual sinks</li>
                    </ul>
                    <p className="text-xs mt-1">
                      Then select the virtual device in the dropdowns above.
                    </p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="font-medium mb-1 text-foreground">
                      Device Selection
                    </p>
                    <p className="text-xs">
                      The selected microphone and speaker will be used for the
                      voice agent. Make sure to grant permissions when prompted.
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
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
