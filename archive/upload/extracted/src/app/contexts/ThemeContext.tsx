import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeColor = "mono-noir" | "sage" | "lavender" | "rose" | "ocean" | "sand";

export const themes: Record<ThemeColor, {
  name: string;
  emoji: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
}> = {
  "mono-noir": {
    name: "Classic Mono Noir",
    emoji: "🖤",
    background: "#0A0A0A",
    surface: "#1A1A1A",
    surfaceVariant: "#242424",
    primary: "#FFFFFF",
    secondary: "#8B8B8B",
    accent: "#E0E0E0",
    text: "#FFFFFF",
    textSecondary: "#A8A8A8",
    border: "#2A2A2A",
  },
  sage: {
    name: "Serene Sage",
    emoji: "🌿",
    background: "#F5F7F5",
    surface: "#FFFFFF",
    surfaceVariant: "#E8EDE8",
    primary: "#5C7C5C",
    secondary: "#8B9E8B",
    accent: "#A8C5A8",
    text: "#2C3E2C",
    textSecondary: "#6B7D6B",
    border: "#D5E0D5",
  },
  lavender: {
    name: "Dreamy Lavender",
    emoji: "💜",
    background: "#F7F5FA",
    surface: "#FFFFFF",
    surfaceVariant: "#EDE8F5",
    primary: "#7C6B9E",
    secondary: "#9B8CB5",
    accent: "#C4B5E0",
    text: "#3E2C5C",
    textSecondary: "#7D6B9B",
    border: "#E0D5F0",
  },
  rose: {
    name: "Gentle Rose",
    emoji: "🌸",
    background: "#FDF5F7",
    surface: "#FFFFFF",
    surfaceVariant: "#F5E8ED",
    primary: "#C77D8F",
    secondary: "#D89BAB",
    accent: "#F0C4D0",
    text: "#5C2C3E",
    textSecondary: "#9B6B7D",
    border: "#F0D5E0",
  },
  ocean: {
    name: "Calm Ocean",
    emoji: "🌊",
    background: "#F5F9FC",
    surface: "#FFFFFF",
    surfaceVariant: "#E8F1F8",
    primary: "#4A7C9E",
    secondary: "#6B9BB5",
    accent: "#A8C9E0",
    text: "#2C3E5C",
    textSecondary: "#6B7D9B",
    border: "#D5E5F0",
  },
  sand: {
    name: "Warm Sand",
    emoji: "🏖️",
    background: "#FAF8F5",
    surface: "#FFFFFF",
    surfaceVariant: "#F0EDE8",
    primary: "#9E7C5C",
    secondary: "#B59B8B",
    accent: "#E0C4A8",
    text: "#5C3E2C",
    textSecondary: "#9B7D6B",
    border: "#F0E0D5",
  },
};

interface ThemeContextType {
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem("abantika-theme");
    return (saved as ThemeColor) || "mono-noir";
  });

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
    localStorage.setItem("abantika-theme", newTheme);
  };

  useEffect(() => {
    const themeColors = themes[theme];
    const root = document.documentElement;
    
    root.style.setProperty("--app-background", themeColors.background);
    root.style.setProperty("--app-surface", themeColors.surface);
    root.style.setProperty("--app-surface-variant", themeColors.surfaceVariant);
    root.style.setProperty("--app-primary", themeColors.primary);
    root.style.setProperty("--app-secondary", themeColors.secondary);
    root.style.setProperty("--app-accent", themeColors.accent);
    root.style.setProperty("--app-text", themeColors.text);
    root.style.setProperty("--app-text-secondary", themeColors.textSecondary);
    root.style.setProperty("--app-border", themeColors.border);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
