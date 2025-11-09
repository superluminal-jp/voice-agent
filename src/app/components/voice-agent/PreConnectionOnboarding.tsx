/**
 * PreConnectionOnboarding Component
 * 
 * Displays onboarding information and quick settings preview before connection.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Mic, Settings, Info } from "lucide-react";
import type { InputMode, VadMode, AudioDevices } from "@/types/voice-agent";

interface PreConnectionOnboardingProps {
  inputMode: InputMode;
  vadMode: VadMode;
  selectedMicrophone: string;
  systemAudioEnabled: boolean;
  audioDevices: AudioDevices;
  onAudioSettingsClick: () => void;
  onSystemPromptClick: () => void;
}

export function PreConnectionOnboarding({
  inputMode,
  vadMode,
  selectedMicrophone,
  systemAudioEnabled,
  audioDevices,
  onAudioSettingsClick,
  onSystemPromptClick,
}: PreConnectionOnboardingProps) {
  return (
    <div className="space-y-6 py-6">
      {/* Welcome Section */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Volume2 className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Welcome to Voice Agent</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Start a real-time voice conversation with AI. Click Connect to begin.
          </p>
        </div>
      </div>

      {/* Quick Settings Preview */}
      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Current Settings
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAudioSettingsClick}
            className="h-7 text-xs"
          >
            Change
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Input Mode:</span>
            <Badge variant="outline" className="text-xs">
              {inputMode === "always_on"
                ? "Always On"
                : inputMode === "push_to_talk"
                ? "Push to Talk"
                : "Toggle"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">VAD Sensitivity:</span>
            <Badge variant="outline" className="text-xs capitalize">
              {vadMode}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Microphone:</span>
            <span className="text-xs font-medium truncate max-w-[150px]">
              {selectedMicrophone
                ? audioDevices.microphones.find(
                    (d) => d.deviceId === selectedMicrophone
                  )?.label || "Default"
                : "Default"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">System Audio:</span>
            <Badge
              variant={systemAudioEnabled ? "default" : "outline"}
              className="text-xs"
            >
              {systemAudioEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onAudioSettingsClick}
          className="gap-2"
        >
          <Mic className="h-4 w-4" />
          Configure Audio
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSystemPromptClick}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Edit System Prompt
        </Button>
      </div>

      {/* Usage Tips */}
      <div className="border-t pt-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Quick Tips:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                Make sure your microphone is working before connecting
              </li>
              <li>
                {inputMode === "always_on"
                  ? "The AI will automatically detect when you speak"
                  : inputMode === "push_to_talk"
                  ? "Hold Space key to transmit your voice"
                  : "Press Space key to toggle microphone on/off"}
              </li>
              <li>
                You can customize the AI's behavior by editing the system
                prompt
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

