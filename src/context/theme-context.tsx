import { createContext, useContext } from "react";

export interface ThemeConfig {
  heroHeight: "small" | "medium" | "large" | "fullscreen";
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroOverlayOpacity: number;
  gridCols: 2 | 3;
  cardStyle: "shadow" | "bordered" | "minimal";
  showCategories: boolean;
  showFeatured: boolean;
  showAllProducts: boolean;
  featuredTitle: string;
  latestTitle: string;
  navbarStyle: "white" | "colored" | "transparent";
  announcementBar: string;
  announcementBarBg: string;
  announcementBarText: string;
  buttonRadius: "sm" | "md" | "lg" | "full";
  instagram: string;
  tiktok: string;
  footerText: string;
  sectionOrder: string[]; // e.g. ["categories", "featured", "allProducts"]
}

export const DEFAULT_THEME: ThemeConfig = {
  heroHeight: "medium",
  heroTitle: "",
  heroSubtitle: "",
  heroCtaText: "Shop Now",
  heroOverlayOpacity: 40,
  gridCols: 2,
  cardStyle: "shadow",
  showCategories: true,
  showFeatured: true,
  showAllProducts: true,
  featuredTitle: "Featured",
  latestTitle: "Latest Arrivals",
  navbarStyle: "white",
  announcementBar: "",
  announcementBarBg: "#C1121F",
  announcementBarText: "#ffffff",
  buttonRadius: "full",
  instagram: "",
  tiktok: "",
  footerText: "",
  sectionOrder: ["categories", "featured", "allProducts"],
};

export function parseThemeConfig(raw: string | null | undefined): ThemeConfig {
  if (!raw) return DEFAULT_THEME;
  try {
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME;
  }
}

export const ThemeContext = createContext<ThemeConfig>(DEFAULT_THEME);

export function useTheme() {
  return useContext(ThemeContext);
}

export function getBtnRadius(r: ThemeConfig["buttonRadius"]) {
  return r === "sm" ? "rounded-md" : r === "md" ? "rounded-xl" : r === "lg" ? "rounded-2xl" : "rounded-full";
}

export function getCardClass(style: ThemeConfig["cardStyle"]) {
  switch (style) {
    case "bordered": return "border-2 border-gray-200 shadow-none";
    case "minimal": return "border-none shadow-none bg-transparent";
    default: return "shadow-[0_2px_12px_rgba(0,0,0,0.06)] border-none";
  }
}

export function getHeroHeight(h: ThemeConfig["heroHeight"]) {
  switch (h) {
    case "small": return "h-[140px]";
    case "large": return "h-[320px]";
    case "fullscreen": return "h-[100dvh]";
    default: return "h-[220px]";
  }
}
