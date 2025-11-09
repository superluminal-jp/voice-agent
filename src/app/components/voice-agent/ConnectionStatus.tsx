/**
 * ConnectionStatus Component
 *
 * Displays connection status and related badges.
 */

import { Button } from "@/components/ui/button";
import { Mic, Phone, PhoneOff, Settings } from "lucide-react";
import type { InputMode } from "@/types/voice-agent";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
  isPTTActive: boolean;
  inputMode: InputMode;
  systemAudioEnabled: boolean;
  inputAudioLevel?: number;
  onAudioSettingsClick: () => void;
  onSystemPromptClick: () => void;
  onInputModeChange?: (mode: InputMode) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  isListening,
  isAISpeaking,
  isPTTActive,
  inputMode,
  systemAudioEnabled,
  inputAudioLevel = 0,
  onAudioSettingsClick,
  onSystemPromptClick,
  onInputModeChange,
  onConnect,
  onDisconnect,
}: ConnectionStatusProps) {
  // When not connected, show prominent Connect button
  if (!isConnected && !isConnecting) {
    const inputModeLabels: Record<InputMode, string> = {
      always_on: "Always On",
      push_to_talk: "Push to Talk",
      toggle: "Toggle",
    };

    const inputModeDescriptions: Record<InputMode, string> = {
      always_on: "Auto detect",
      push_to_talk: "Hold Space",
      toggle: "Press Space",
    };

    return (
      <div className="flex flex-col items-center gap-8 py-12">
        {/* Prominent Connect Button */}
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          size="xl"
          className="h-16 px-12 text-lg font-medium gap-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/95"
        >
          <Phone className="h-6 w-6" strokeWidth={2} />
          Connect
        </Button>

        {/* Input Mode Quick Switcher */}
        {onInputModeChange && (
          <div className="flex flex-col items-center gap-3 w-full max-w-md">
            <div className="text-xs text-muted-foreground font-medium">
              Input Mode
            </div>
            <div className="flex items-center gap-2 w-full">
              {(Object.keys(inputModeLabels) as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onInputModeChange(mode)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    inputMode === mode
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <div className="font-medium">{inputModeLabels[mode]}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {inputModeDescriptions[mode]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Secondary actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAudioSettingsClick}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            <Mic className="h-4 w-4" />
            Audio Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSystemPromptClick}
            className="gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            <Settings className="h-4 w-4" />
            System Prompt
          </Button>
        </div>
      </div>
    );
  }

  // When connecting, show connecting state
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <Button
          onClick={onConnect}
          disabled={isConnecting}
          size="xl"
          className="h-16 px-12 text-lg font-medium gap-3 rounded-full shadow-sm"
        >
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Connecting...
        </Button>
      </div>
    );
  }

  // When connected, show large microphone button with audio level feedback
  const isMicActive = inputMode === "always_on" || isPTTActive;
  const audioLevel = inputAudioLevel || 0;

  // Calculate non-linear height for microphone icon fill
  // Ensures small audio levels are still visible (minimum 25% height)
  // Uses square root function for smooth non-linear scaling
  const getMicrophoneFillHeight = (level: number): number => {
    if (level === 0) return 0;
    const normalizedLevel = level / 100;
    // Minimum 25% height, scales to 100% using square root for non-linear response
    // Square root ensures small values still show meaningful height
    return 25 + Math.sqrt(normalizedLevel) * 75;
  };

  // Monochrome audio level representation
  // Use brightness, size, shadow, and stroke width to indicate level
  const getMonochromeStyle = () => {
    if (!isMicActive) {
      return {
        bgColor: "bg-muted",
        textColor: "text-muted-foreground",
        borderColor: "border-muted",
        borderWidth: 2,
        scale: 1,
        shadowIntensity: 0,
        brightness: 0.7,
      };
    }

    // Calculate brightness: 0.6 (darker) to 1.0 (bright) based on audio level
    const brightness = 0.6 + (audioLevel / 100) * 0.4;
    // Calculate scale: 1.0 to 1.12 based on audio level
    const scale = 1.0 + (audioLevel / 100) * 0.12;
    // Calculate shadow intensity: 0 to 30px based on audio level
    const shadowIntensity = (audioLevel / 100) * 30;
    // Calculate border width: 2px to 6px based on audio level
    const borderWidth = 2 + (audioLevel / 100) * 4;

    // Use foreground color with varying opacity for monochrome
    const opacity = brightness;

    return {
      bgColor: "bg-background",
      textColor: "text-foreground",
      borderColor: "border-foreground",
      borderWidth,
      scale,
      shadowIntensity,
      brightness: opacity,
    };
  };

  const style = getMonochromeStyle();

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Large Microphone Button with Monochrome Audio Level Feedback */}
      <div className="relative flex items-center justify-center">
        {/* Outer container with border */}
        <div
          className="w-24 h-24 rounded-full border-2 border-foreground flex items-center justify-center transition-all duration-150 relative overflow-visible"
          style={{
            transform: `scale(${style.scale})`,
            borderWidth: `${style.borderWidth}px`,
            opacity: style.brightness,
            boxShadow:
              style.shadowIntensity > 0
                ? `0 0 ${style.shadowIntensity}px rgba(0, 0, 0, ${
                    0.2 + (audioLevel / 100) * 0.3
                  })`
                : "none",
          }}
        >
          {/* Microphone icon with audio level fill effect */}
          <div className="relative w-12 h-12">
            {/* Background microphone icon (always visible, muted) */}
            <Mic
              className="absolute inset-0 h-12 w-12 text-muted-foreground transition-all duration-150"
              strokeWidth={2}
              style={{
                opacity: 0.3,
              }}
            />

            {/* Foreground microphone icon (clipped by audio level) */}
            <div
              className="absolute left-0 right-0 bottom-0 overflow-hidden"
              style={{
                height: `${
                  isMicActive ? getMicrophoneFillHeight(audioLevel) : 0
                }%`,
                transition: "height 0.1s ease-out",
              }}
            >
              <Mic
                className="absolute bottom-0 left-0 h-12 w-12 text-foreground transition-all duration-150"
                strokeWidth={2 + (audioLevel / 100) * 1.5}
                style={{
                  opacity: style.brightness,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAudioSettingsClick}
          className="gap-2"
        >
          <Mic className="h-4 w-4" />
          Audio Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSystemPromptClick}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          System Prompt
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDisconnect}
          className="gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    </div>
  );
}
