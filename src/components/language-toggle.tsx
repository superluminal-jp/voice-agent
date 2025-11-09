"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

/**
 * LanguageToggle component that allows users to switch between languages.
 *
 * @returns LanguageToggle component
 */
export function LanguageToggle() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
  ];

  return (
    <Select
      value={i18n.language}
      onValueChange={(value) => i18n.changeLanguage(value)}
    >
      <SelectTrigger className="w-10 h-10 p-2 border-0 shadow-none [&>svg:last-child]:hidden">
        <Languages className="h-5 w-5" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

