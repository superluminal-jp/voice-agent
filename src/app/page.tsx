"use client";

import Link from "next/link";
import VoiceAgent from "./components/VoiceAgent";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header with utility buttons in top right */}
        <div className="relative mb-8">
          <div className="absolute top-0 right-0 flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <Link href="/tutorial" title={t("app.tutorial")}>
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
              {t("app.title")}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("app.subtitle")}
            </p>
          </div>
        </div>
        <VoiceAgent />
      </div>
    </main>
  );
}
