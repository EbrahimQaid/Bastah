import { createContext, useContext } from "react";

export interface StoreUIContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const StoreUIContext = createContext<StoreUIContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function useStoreUI() {
  return useContext(StoreUIContext);
}
