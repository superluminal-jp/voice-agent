"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";
import {
  Mic,
  Settings,
  Monitor,
  MessageSquare,
  Volume2,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Users,
  FileText,
  Languages,
  Headphones,
  BookOpen,
  Info,
} from "lucide-react";
import { getSystemPromptTemplates } from "@/lib/system-prompt-templates";

export default function TutorialPage() {
  const { t, i18n } = useTranslation();
  const SYSTEM_PROMPT_TEMPLATES = getSystemPromptTemplates(i18n.language);
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-black dark:to-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header with utility buttons in top right */}
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              {t("tutorial.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("tutorial.subtitle")}
            </p>
            <div className="mt-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  {t("tutorial.backToHome")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-black dark:text-white" />
              {t("tutorial.quickStart.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.quickStart.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t("tutorial.quickStart.step1.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("tutorial.quickStart.step1.description")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t("tutorial.quickStart.step2.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("tutorial.quickStart.step2.description")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t("tutorial.quickStart.step3.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("tutorial.quickStart.step3.description")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t("tutorial.quickStart.step4.title")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("tutorial.quickStart.step4.description")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Features */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("tutorial.mainFeatures.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.mainFeatures.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Mic className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.mainFeatures.inputModes.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("tutorial.mainFeatures.inputModes.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Monitor className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.mainFeatures.systemAudio.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("tutorial.mainFeatures.systemAudio.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.mainFeatures.systemPrompt.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("tutorial.mainFeatures.systemPrompt.description")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.mainFeatures.audioDevices.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("tutorial.mainFeatures.audioDevices.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Use Cases */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {t("tutorial.useCases.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.useCases.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.useCases.meetingAssistant.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("tutorial.useCases.meetingAssistant.description")}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {t("tutorial.useCases.meetingAssistant.step1")}</p>
                      <p>• {t("tutorial.useCases.meetingAssistant.step2")}</p>
                      <p>• {t("tutorial.useCases.meetingAssistant.step3")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.useCases.voiceMemo.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("tutorial.useCases.voiceMemo.description")}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {t("tutorial.useCases.voiceMemo.step1")}</p>
                      <p>• {t("tutorial.useCases.voiceMemo.step2")}</p>
                      <p>• {t("tutorial.useCases.voiceMemo.step3")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.useCases.realtimeAssistant.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("tutorial.useCases.realtimeAssistant.description")}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {t("tutorial.useCases.realtimeAssistant.step1")}</p>
                      <p>• {t("tutorial.useCases.realtimeAssistant.step2")}</p>
                      <p>• {t("tutorial.useCases.realtimeAssistant.step3")}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <Languages className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.useCases.translation.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("tutorial.useCases.translation.description")}
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• {t("tutorial.useCases.translation.step1")}</p>
                      <p>• {t("tutorial.useCases.translation.step2")}</p>
                      <p>• {t("tutorial.useCases.translation.step3")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Audio Setup */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {t("tutorial.systemAudioSetup.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.systemAudioSetup.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold mb-2">
                  {t("tutorial.systemAudioSetup.quickSetup.title")}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>1. {t("tutorial.systemAudioSetup.quickSetup.step1")}</p>
                  <p>2. {t("tutorial.systemAudioSetup.quickSetup.step2")}</p>
                  <p>3. {t("tutorial.systemAudioSetup.quickSetup.step3")}</p>
                  <p>4. {t("tutorial.systemAudioSetup.quickSetup.step4")}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm">
                  {t("tutorial.systemAudioSetup.quickSetupNote")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">
                  {t("tutorial.systemAudioSetup.advancedSetup.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("tutorial.systemAudioSetup.advancedSetup.description")}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    • {t("tutorial.systemAudioSetup.advancedSetup.windows")}
                  </p>
                  <p>• {t("tutorial.systemAudioSetup.advancedSetup.macos")}</p>
                  <p>• {t("tutorial.systemAudioSetup.advancedSetup.linux")}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted mt-4">
                <p className="text-sm">
                  {t("tutorial.systemAudioSetup.advancedSetupNote")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Modes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              {t("tutorial.inputModes.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.inputModes.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">
                  {t("tutorial.inputModes.alwaysOn.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("tutorial.inputModes.alwaysOn.description")}
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>
                      {t("tutorial.inputModes.alwaysOn.recommended")}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">
                  {t("tutorial.inputModes.pushToTalk.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("tutorial.inputModes.pushToTalk.description")}
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>
                      {t("tutorial.inputModes.pushToTalk.recommended")}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">
                  {t("tutorial.inputModes.toggle.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {t("tutorial.inputModes.toggle.description")}
                </p>
                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>
                      {t("tutorial.inputModes.toggle.recommended")}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Prompt Templates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t("tutorial.systemPromptTemplates.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.systemPromptTemplates.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border bg-card space-y-3"
                >
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>

                  {template.whenToUse.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {t("tutorial.systemPromptTemplates.whenToUse")}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                        {template.whenToUse.map((use, index) => (
                          <li key={index}>{use}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {template.notes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {t("tutorial.systemPromptTemplates.notes")}
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside ml-2">
                        {template.notes.map((note, index) => (
                          <li key={index}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div>
                      <span className="font-medium">
                        {t(
                          "tutorial.systemPromptTemplates.recommendedInputMode"
                        )}
                        :
                      </span>{" "}
                      {t(`inputMode.${template.recommendedInputMode}`)}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t(
                          "tutorial.systemPromptTemplates.recommendedAudioSource"
                        )}
                        :
                      </span>{" "}
                      {t(`audioSource.${template.recommendedAudioSource}`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {t("tutorial.troubleshooting.title")}
            </CardTitle>
            <CardDescription>
              {t("tutorial.troubleshooting.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.troubleshooting.micNotRecognized.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      • {t("tutorial.troubleshooting.micNotRecognized.step1")}
                      <br />•{" "}
                      {t("tutorial.troubleshooting.micNotRecognized.step2")}
                      <br />•{" "}
                      {t("tutorial.troubleshooting.micNotRecognized.step3")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t(
                        "tutorial.troubleshooting.systemAudioNotCaptured.title"
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      •{" "}
                      {t(
                        "tutorial.troubleshooting.systemAudioNotCaptured.step1"
                      )}
                      <br />•{" "}
                      {t(
                        "tutorial.troubleshooting.systemAudioNotCaptured.step2"
                      )}
                      <br />•{" "}
                      {t(
                        "tutorial.troubleshooting.systemAudioNotCaptured.step3"
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      {t("tutorial.troubleshooting.connectionError.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      • {t("tutorial.troubleshooting.connectionError.step1")}
                      <br />•{" "}
                      {t("tutorial.troubleshooting.connectionError.step2")}
                      <br />•{" "}
                      {t("tutorial.troubleshooting.connectionError.step3")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link href="/">
              {t("tutorial.startApp")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
