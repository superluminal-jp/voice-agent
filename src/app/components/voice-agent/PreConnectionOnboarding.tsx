/**
 * PreConnectionOnboarding Component
 * 
 * Displays onboarding information and quick settings preview before connection.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2, Mic, Settings, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const getInputModeLabel = (mode: InputMode) => {
    switch (mode) {
      case "always_on":
        return t("connection.inputMode.alwaysOn");
      case "push_to_talk":
        return t("connection.inputMode.pushToTalk");
      case "toggle":
        return t("connection.inputMode.toggle");
    }
  };

  const getTip2 = () => {
    switch (inputMode) {
      case "always_on":
        return t("onboarding.tip2AlwaysOn");
      case "push_to_talk":
        return t("onboarding.tip2PushToTalk");
      case "toggle":
        return t("onboarding.tip2Toggle");
    }
  };

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
          <h3 className="text-lg font-semibold">{t("onboarding.welcome")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("onboarding.welcomeDescription")}
          </p>
        </div>
      </div>

      {/* Quick Settings Preview */}
      <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t("onboarding.currentSettings")}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onAudioSettingsClick}
            className="h-7 text-xs"
          >
            {t("common.change")}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("connection.inputMode.label")}:</span>
            <Badge variant="outline" className="text-xs">
              {getInputModeLabel(inputMode)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("onboarding.vadSensitivity")}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {t(`audio.voiceDetection.${vadMode}`)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("audio.devices.microphone")}:</span>
            <span className="text-xs font-medium truncate max-w-[150px]">
              {selectedMicrophone
                ? audioDevices.microphones.find(
                    (d) => d.deviceId === selectedMicrophone
                  )?.label || t("common.default")
                : t("common.default")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t("audio.systemAudio.title")}:</span>
            <Badge
              variant={systemAudioEnabled ? "default" : "outline"}
              className="text-xs"
            >
              {systemAudioEnabled ? t("common.enabled") : t("common.disabled")}
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
          {t("onboarding.configureAudio")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSystemPromptClick}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          {t("onboarding.editSystemPrompt")}
        </Button>
      </div>

      {/* Usage Tips */}
      <div className="border-t pt-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t("onboarding.quickTips")}</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>{t("onboarding.tip1")}</li>
              <li>{getTip2()}</li>
              <li>{t("onboarding.tip3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

