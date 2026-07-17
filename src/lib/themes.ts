export type ThemeId =
  | "linen"
  | "noir"
  | "sage"
  | "lavender"
  | "rose"
  | "ocean"
  | "sand"
  | "midnight"
  | "peach"
  | "forest"
  | "sunset"
  | "coral"
  | "indigo"
  | "mint"
  | "dusk";

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  emoji: string;
  tagline: string;
  swatches: string[];
  isDark: boolean;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "linen",
    name: "Warm Linen",
    emoji: "🪵",
    tagline: "Cozy, earthy & calm",
    swatches: ["#C97B5C", "#E8C9B0", "#FAF6F0", "#3D2E22"],
    isDark: false,
  },
  {
    id: "noir",
    name: "Mono Noir",
    emoji: "🖤",
    tagline: "Bold high contrast",
    swatches: ["#F5F5F5", "#333333", "#1A1A1A", "#0A0A0A"],
    isDark: true,
  },
  {
    id: "sage",
    name: "Serene Sage",
    emoji: "🌿",
    tagline: "Grounded & green",
    swatches: ["#5C7C5C", "#A8C5A8", "#F5F7F5", "#2C3E2C"],
    isDark: false,
  },
  {
    id: "lavender",
    name: "Dreamy Lavender",
    emoji: "💜",
    tagline: "Soft & meditative",
    swatches: ["#7C6B9E", "#C4B5E0", "#F7F5FA", "#3E2C5C"],
    isDark: false,
  },
  {
    id: "rose",
    name: "Gentle Rose",
    emoji: "🌸",
    tagline: "Warm & tender",
    swatches: ["#C77D8F", "#F0C4D0", "#FDF5F7", "#5C2C3E"],
    isDark: false,
  },
  {
    id: "ocean",
    name: "Calm Ocean",
    emoji: "🌊",
    tagline: "Cool & clarifying",
    swatches: ["#4A7C9E", "#A8C9E0", "#F5F9FC", "#2C3E5C"],
    isDark: false,
  },
  {
    id: "sand",
    name: "Warm Sand",
    emoji: "🏖️",
    tagline: "Sun-washed & neutral",
    swatches: ["#9E7C5C", "#E0C4A8", "#FAF8F5", "#5C3E2C"],
    isDark: false,
  },
  {
    id: "midnight",
    name: "Midnight Bloom",
    emoji: "🌌",
    tagline: "Deep night with floral glow",
    swatches: ["#B57BCE", "#5B3A7A", "#1B1530", "#0E0A1F"],
    isDark: true,
  },
  {
    id: "peach",
    name: "Soft Peach",
    emoji: "🍑",
    tagline: "Sweet & sun-kissed",
    swatches: ["#E8987A", "#F5C9B0", "#FDF4EF", "#5C3A28"],
    isDark: false,
  },
  {
    id: "forest",
    name: "Deep Forest",
    emoji: "🌲",
    tagline: "Grounded dark green",
    swatches: ["#A8D5A8", "#4A6B4A", "#1E2E22", "#0F1A13"],
    isDark: true,
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    emoji: "🌅",
    tagline: "Warm horizon hues",
    swatches: ["#E8826B", "#F5B57A", "#FDEFE0", "#5C2E1E"],
    isDark: false,
  },
  {
    id: "coral",
    name: "Coral Reef",
    emoji: "🪸",
    tagline: "Vibrant & alive",
    swatches: ["#FF7A6B", "#FFB39A", "#FFF1ED", "#5C1E16"],
    isDark: false,
  },
  {
    id: "indigo",
    name: "Indigo Night",
    emoji: "🔮",
    tagline: "Mystic & deep",
    swatches: ["#7B8AF0", "#3A4A8E", "#1A1F3A", "#0E1226"],
    isDark: true,
  },
  {
    id: "mint",
    name: "Fresh Mint",
    emoji: "🍃",
    tagline: "Crisp & clean",
    swatches: ["#4ECDC4", "#A8E6E0", "#F0FBFA", "#1E4A47"],
    isDark: false,
  },
  {
    id: "dusk",
    name: "Dusky Mauve",
    emoji: "🌆",
    tagline: "Soft twilight tones",
    swatches: ["#A07A8E", "#D4B8C4", "#F5EDEF", "#3E2C36"],
    isDark: false,
  },
];
