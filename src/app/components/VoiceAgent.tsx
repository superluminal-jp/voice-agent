"use client";

import { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Phone,
  PhoneOff,
  Volume2,
  MessageSquare,
  Trash2,
  User,
  Bot,
  Settings,
  Mic,
  Speaker,
  RefreshCw,
  Monitor,
  Info,
} from "lucide-react";

// VAD Configuration Types
type VadMode = "conservative" | "balanced" | "responsive";

// VAD Presets
const VAD_PRESETS = {
  conservative: {
    type: "semantic_vad" as const,
    eagerness: "low" as const,
  },
  balanced: {
    type: "server_vad" as const,
    threshold: 0.6,
    silence_duration_ms: 800,
    prefix_padding_ms: 300,
  },
  responsive: {
    type: "server_vad" as const,
    threshold: 0.5,
    silence_duration_ms: 500,
    prefix_padding_ms: 300,
  },
} as const;

export default function VoiceAgent() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    RealtimeItem[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful assistant."
  );
  const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);
  const [tempPrompt, setTempPrompt] = useState("");
  const [isAudioDialogOpen, setIsAudioDialogOpen] = useState(false);
  const [audioDevices, setAudioDevices] = useState<{
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>({ microphones: [], speakers: [] });
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [systemAudioEnabled, setSystemAudioEnabled] = useState(false);
  const [systemAudioStream, setSystemAudioStream] =
    useState<MediaStream | null>(null);
  const [mixedAudioStream, setMixedAudioStream] = useState<MediaStream | null>(
    null
  );
  const [vadMode, setVadMode] = useState<VadMode>("conservative");
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<RealtimeSession | null>(null);
  const agentRef = useRef<RealtimeAgent | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Enumerate audio devices
  const enumerateAudioDevices = async () => {
    setIsLoadingDevices(true);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const microphones = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput"
      );

      setAudioDevices({ microphones, speakers });

      // Set default selections if not already set
      if (!selectedMicrophone && microphones.length > 0) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
      if (!selectedSpeaker && speakers.length > 0) {
        setSelectedSpeaker(speakers[0].deviceId);
      }
    } catch (error) {
      console.error("Error enumerating audio devices:", error);
      setError(
        "Failed to access audio devices. Please check your microphone permissions."
      );
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // Check browser compatibility for system audio capture
  const checkSystemAudioSupport = (): { supported: boolean; reason?: string } => {
    // Check if getDisplayMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return {
        supported: false,
        reason: "Your browser doesn't support screen sharing."
      };
    }

    // Check browser type
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes("chrome") && !userAgent.includes("edg");
    const isEdge = userAgent.includes("edg");
    const isFirefox = userAgent.includes("firefox");
    const isSafari = userAgent.includes("safari") && !userAgent.includes("chrome");

    if (isSafari) {
      return {
        supported: false,
        reason: "Safari doesn't support system audio capture. Please use Chrome, Edge, or Firefox."
      };
    }

    if (isFirefox) {
      return {
        supported: true,
        reason: "Firefox has limited support. If it doesn't work, try Chrome or Edge."
      };
    }

    return { supported: true };
  };

  // Capture system audio via screen sharing
  const captureSystemAudio = async () => {
    // Clear any previous errors
    setError(null);

    // Check browser compatibility
    const compatibility = checkSystemAudioSupport();
    if (!compatibility.supported) {
      setError(compatibility.reason || "Browser not supported");
      return;
    }

    try {
      // Request screen sharing with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as any,
      });

      // Extract only the audio track
      const audioTrack = displayStream.getAudioTracks()[0];

      // Stop the video track as we only need audio
      displayStream.getVideoTracks().forEach((track) => track.stop());

      if (!audioTrack) {
        // User didn't check "Share system audio" - this is not a critical error
        console.warn("No audio track found. User may not have checked 'Share system audio'.");

        setError(
          "No system audio detected. Please try again and make sure to:\n" +
          "1. Check the 'Share system audio' or 'Share tab audio' checkbox\n" +
          "2. Select a tab/window that's actually playing audio\n" +
          (compatibility.reason ? `\n${compatibility.reason}` : "")
        );

        setSystemAudioEnabled(false);
        return;
      }

      // Create a new stream with only audio
      const audioStream = new MediaStream([audioTrack]);
      setSystemAudioStream(audioStream);
      setSystemAudioEnabled(true);

      // Clear any error messages on success
      setError(null);

      // Listen for when the user stops sharing
      audioTrack.onended = () => {
        setSystemAudioEnabled(false);
        setSystemAudioStream(null);
        console.log("System audio capture stopped");
      };

      console.log("System audio captured successfully");
    } catch (error) {
      console.error("Error capturing system audio:", error);

      // Provide specific error messages based on the error type
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          setError(
            "Permission denied. Please allow screen sharing to capture system audio."
          );
        } else if (error.name === "NotFoundError") {
          setError(
            "No screen sharing source found. Please try again and select a screen or window."
          );
        } else if (error.name === "NotSupportedError") {
          setError(
            "System audio capture is not supported by your browser. " +
            (compatibility.reason || "Try using Chrome or Edge for best results.")
          );
        } else {
          setError(
            `Failed to capture system audio: ${error.message}\n\n` +
            "Tips:\n" +
            "• Make sure to check 'Share system audio' in the dialog\n" +
            "• Select a tab/window that's playing audio\n" +
            "• Try Chrome or Edge for best compatibility"
          );
        }
      } else {
        setError(
          "Failed to capture system audio. Make sure to check 'Share system audio' when selecting the screen."
        );
      }

      setSystemAudioEnabled(false);
    }
  };

  // Stop system audio capture
  const stopSystemAudio = () => {
    if (systemAudioStream) {
      systemAudioStream.getTracks().forEach((track) => track.stop());
      setSystemAudioStream(null);
    }
    setSystemAudioEnabled(false);
  };

  // Mix microphone and system audio streams
  const mixAudioStreams = async (
    micStream: MediaStream,
    sysStream: MediaStream | null
  ): Promise<MediaStream> => {
    if (!sysStream) {
      return micStream;
    }

    try {
      // Create audio context
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      // Create source nodes
      const micSource = audioContext.createMediaStreamSource(micStream);
      const sysSource = audioContext.createMediaStreamSource(sysStream);

      // Create destination
      const destination = audioContext.createMediaStreamDestination();

      // Create gain nodes for volume control
      const micGain = audioContext.createGain();
      const sysGain = audioContext.createGain();

      // Set gain values (adjust as needed)
      micGain.gain.value = 1.0; // Microphone at 100%
      sysGain.gain.value = 0.7; // System audio at 70% to prevent overwhelming

      // Connect the audio graph
      micSource.connect(micGain);
      sysGain.connect(destination);
      micGain.connect(destination);
      sysSource.connect(sysGain);

      console.log("Audio streams mixed successfully");
      return destination.stream;
    } catch (error) {
      console.error("Error mixing audio streams:", error);
      return micStream;
    }
  };

  // Helper function to extract text content from RealtimeItem
  const getItemText = (item: RealtimeItem): string => {
    if (item.type === "message" && item.content) {
      if (Array.isArray(item.content)) {
        return item.content
          .map((c) => {
            if ("text" in c && c.text) return c.text;
            if ("transcript" in c && c.transcript) return c.transcript;
            return "";
          })
          .join(" ");
      }
      return String(item.content);
    }
    if (item.type === "message" && "transcript" in item && item.transcript) {
      return String(item.transcript);
    }
    return JSON.stringify(item, null, 2);
  };

  // Generate ephemeral key directly (for development/testing)
  const generateEphemeralKey = async (): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OpenAI API key not configured. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable."
      );
    }

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
      const errorData = await response.text();
      throw new Error(`Failed to generate ephemeral key: ${errorData}`);
    }

    const data = await response.json();
    return data.value;
  };

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

      // Store microphone stream reference for cleanup
      micStreamRef.current = micStream;

      // Mix microphone with system audio if enabled
      const finalStream = systemAudioStream
        ? await mixAudioStreams(micStream, systemAudioStream)
        : micStream;

      // Store mixed stream for cleanup
      if (finalStream !== micStream) {
        setMixedAudioStream(finalStream);
      }

      // Create custom WebRTC transport with the mixed audio stream
      const transport = new OpenAIRealtimeWebRTC({
        mediaStream: finalStream,
      });

      // Create session with custom transport and VAD configuration
      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
        transport: transport,
        config: {
          audio: {
            input: {
              turnDetection: VAD_PRESETS[vadMode],
            },
          },
        },
      });

      await session.connect({ apiKey: ephemeralKey });

      // Set up conversation history listener
      session.on("history_updated", (history: RealtimeItem[]) => {
        setConversationHistory(history);
        // Auto-scroll to bottom when new message arrives
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
      });

      // Set up speech detection listeners for visual feedback
      (session as any).on("input_audio_buffer.speech_started", () => {
        setIsListening(true);
      });

      (session as any).on("input_audio_buffer.speech_stopped", () => {
        setIsListening(false);
      });

      // Store references
      agentRef.current = agent;
      sessionRef.current = session;

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
    setIsConnected(false);
    setIsListening(false);
    setConversationHistory([]);
  };

  // Load audio devices on mount
  useEffect(() => {
    enumerateAudioDevices();
  }, []);

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
    };
  }, [systemAudioStream]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Voice Agent
          </CardTitle>
          <CardDescription>
            Connect to start a voice conversation with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  isConnected
                    ? "default"
                    : isConnecting
                    ? "secondary"
                    : "outline"
                }
              >
                {isConnected
                  ? "Connected"
                  : isConnecting
                  ? "Connecting..."
                  : "Disconnected"}
              </Badge>
              {systemAudioEnabled && (
                <Badge variant="secondary" className="gap-1">
                  <Monitor className="h-3 w-3" />
                  System Audio Active
                </Badge>
              )}
              {isConnected && isListening && (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <span className="h-2 w-2 bg-white rounded-full animate-pulse" />
                  Listening...
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAudioDialogOpen(true)}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Audio Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openPromptDialog}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                System Prompt
              </Button>
              <Button
                onClick={isConnected ? disconnect : connect}
                disabled={isConnecting}
                variant={isConnected ? "destructive" : "default"}
                className="gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : isConnected ? (
                  <>
                    <PhoneOff className="h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="space-y-2">
                <div className="whitespace-pre-wrap">{error}</div>
                {error.includes("system audio") && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setError(null);
                        captureSystemAudio();
                      }}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          {isConnected && (
            <div className="text-center py-8">
              <Volume2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                You are connected! Start talking to your voice agent.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                The agent will automatically detect when you start and stop
                speaking.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation History */}
      {isConnected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation History
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? "Hide" : "Show"} History
                </Button>
                {conversationHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              {conversationHistory.length} message
              {conversationHistory.length !== 1 ? "s" : ""} in conversation
            </CardDescription>
          </CardHeader>
          {showHistory && (
            <CardContent>
              <ScrollArea
                ref={scrollAreaRef}
                className="h-96 w-full border rounded-md"
              >
                <div className="p-4 space-y-4">
                  {conversationHistory.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No conversation yet</p>
                      <p className="text-sm">
                        Start talking to see the conversation history
                      </p>
                    </div>
                  ) : (
                    conversationHistory.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex-shrink-0">
                          {item.type === "message" && item.role === "user" ? (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                          ) : item.type === "message" &&
                            item.role === "assistant" ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-green-600" />
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
                                ? "You"
                                : item.type === "message" &&
                                  item.role === "assistant"
                                ? "Assistant"
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
      )}

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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Settings
            </DialogTitle>
            <DialogDescription>
              Select your preferred microphone and speaker for the voice agent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Microphone Selection */}
            <div>
              <label
                htmlFor="microphone-select"
                className="text-sm font-medium flex items-center gap-2 mb-2"
              >
                <Mic className="h-4 w-4" />
                Microphone
              </label>
              <Select
                value={selectedMicrophone}
                onValueChange={setSelectedMicrophone}
                disabled={isLoadingDevices}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select microphone..." />
                </SelectTrigger>
                <SelectContent>
                  {audioDevices.microphones.map((device) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Microphone ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VAD Settings Section */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4" />
                Voice Detection Sensitivity
              </label>
              <Select value={vadMode} onValueChange={(value: VadMode) => setVadMode(value)}>
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
                  <strong>Conservative:</strong> Waits for you to finish speaking.
                  Reduces unwanted responses.
                </div>
                <div>
                  <strong>Balanced:</strong> Moderate sensitivity with 800ms silence
                  detection.
                </div>
                <div>
                  <strong>Responsive:</strong> Fast responses, may interrupt
                  occasionally.
                </div>
              </div>
            </div>

            {/* System Audio Section */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4" />
                System Audio Capture
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {systemAudioEnabled ? (
                      <span className="flex items-center gap-2 text-green-600 font-medium">
                        <span className="h-2 w-2 bg-green-600 rounded-full animate-pulse" />
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
                        Stop Capture
                      </>
                    ) : (
                      <>
                        <Monitor className="h-4 w-4" />
                        Start Capture
                      </>
                    )}
                  </Button>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div>
                          <strong>Step-by-step guide:</strong>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                          <li>Click "Start Capture" button above</li>
                          <li>
                            In the browser dialog, select the tab/window with audio
                          </li>
                          <li>
                            <strong className="text-orange-600">
                              ✓ Check "Share system audio" or "Share tab audio"
                            </strong>
                          </li>
                          <li>Click "Share" to start capturing</li>
                        </ol>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <strong>Note:</strong> System audio capture is{" "}
                      <strong className="text-green-600">optional</strong>. The voice
                      agent will work with your microphone only if system audio
                      isn't available.
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
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-between items-center border-t pt-4">
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
                Refresh Devices
              </Button>
              <div className="text-xs text-muted-foreground">
                {audioDevices.microphones.length} microphone(s),{" "}
                {audioDevices.speakers.length} speaker(s)
              </div>
            </div>

            {/* Info */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Device Selection:</strong> The selected microphone and
                speaker will be used for the voice agent. Make sure to grant
                permissions when prompted.
              </p>
              <div className="text-xs">
                <p className="font-medium mb-1">
                  Advanced: Virtual Audio Cables
                </p>
                <p>
                  For better control over system audio routing, install virtual
                  audio software:
                </p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>Windows: VB-Cable, VoiceMeeter</li>
                  <li>macOS: BlackHole, Loopback</li>
                  <li>Linux: PulseAudio virtual sinks</li>
                </ul>
                <p className="mt-1">
                  Then select the virtual device in the dropdowns above.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsAudioDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
