"use client";

import { useTheme } from "next-themes";

export function useThemeMode() {
  const { theme, setTheme } = useTheme();

  return {
    theme: theme ?? "dark",
    setDarkMode: () => setTheme("dark"),
    setHybridMode: () => setTheme("hybrid"),
    setLightMode: () => setTheme("light"),
  };
}
