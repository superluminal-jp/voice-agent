"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

/**
 * ThemeProvider component that wraps the application with next-themes.
 * 
 * Provides theme management functionality including:
 * - System preference detection
 * - Theme persistence in localStorage
 * - Smooth theme transitions
 * 
 * @param props - ThemeProviderProps from next-themes
 * @returns ThemeProvider component
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

