"use client";

import { useTheme } from "next-themes";

export function useThemeMode() {
  const { theme, setTheme } = useTheme();

  return {
    theme: theme ?? "light",
    setDarkMode:  () => setTheme("dark"),
    setLightMode: () => setTheme("light"),
  };
}
