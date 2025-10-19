"use client";

import { useState, useEffect, useRef } from "react";
import {
  RealtimeAgent,
  RealtimeSession,
  RealtimeItem,
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
} from "lucide-react";

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
  const sessionRef = useRef<RealtimeSession | null>(null);
  const agentRef = useRef<RealtimeAgent | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

      // Create session with minimal configuration
      const session = new RealtimeSession(agent, {
        model: "gpt-realtime",
      });

      // Connect to the session with audio device constraints if selected
      const connectOptions: any = { apiKey: ephemeralKey };

      // Note: The RealtimeSession may not support direct device selection
      // This is a placeholder for future SDK updates
      if (selectedMicrophone) {
        connectOptions.audioConstraints = {
          deviceId: { exact: selectedMicrophone },
        };
      }

      await session.connect(connectOptions);

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

    sessionRef.current = null;
    agentRef.current = null;
    setIsConnected(false);
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
    };
  }, []);

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
              <AlertDescription>{error}</AlertDescription>
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

            {/* Refresh Button */}
            <div className="flex justify-between items-center">
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
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Note:</strong> The selected devices will be used when
                you connect to the voice agent. Make sure to grant microphone
                permissions when prompted.
              </p>
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
