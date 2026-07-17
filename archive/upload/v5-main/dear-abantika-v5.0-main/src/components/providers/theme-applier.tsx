"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { THEMES } from "@/lib/themes";

/** Applies the active theme to <html data-theme=...> */
export function ThemeApplier({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);
  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    const meta = THEMES.find((t) => t.id === theme);
    root.style.colorScheme = meta?.isDark ? "dark" : "light";
  }, [theme]);
  return <>{children}</>;
}
