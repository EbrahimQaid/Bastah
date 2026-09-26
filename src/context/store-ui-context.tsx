import { createContext, useContext } from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface StoreUIContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  // Legacy aliases for backward compatibility:
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const StoreUIContext = createContext<StoreUIContextType>({
  themeMode: "system",
  setThemeMode: () => {},
  isDark: false,
  darkMode: false,
  toggleDarkMode: () => {},
});

export function useStoreUI() {
  return useContext(StoreUIContext);
}
