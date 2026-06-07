import { createContext, useContext, useState, ReactNode } from "react";

export type CurrencyCode = "USD" | "SAR" | "YER" | "AED" | "EUR" | "GBP";

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  nameAr: string;
  rate: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  USD: { code: "USD", symbol: "$",    name: "US Dollar",      nameAr: "دولار أمريكي",      rate: 1 },
  SAR: { code: "SAR", symbol: "ر.س", name: "Saudi Riyal",    nameAr: "ريال سعودي",         rate: 3.75 },
  YER: { code: "YER", symbol: "﷼",  name: "Yemeni Rial",    nameAr: "ريال يمني",          rate: 250 },
  AED: { code: "AED", symbol: "د.إ", name: "UAE Dirham",     nameAr: "درهم إماراتي",       rate: 3.67 },
  EUR: { code: "EUR", symbol: "€",   name: "Euro",           nameAr: "يورو",               rate: 0.92 },
  GBP: { code: "GBP", symbol: "£",   name: "British Pound",  nameAr: "جنيه إسترليني",     rate: 0.79 },
};

interface CurrencyContextType {
  activeCurrency: CurrencyInfo;
  setActiveCurrency: (code: CurrencyCode) => void;
  availableCurrencies: CurrencyInfo[];
  setAvailableCurrencies: (currencies: CurrencyInfo[]) => void;
  format: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [activeCurrencyCode, setActiveCurrencyCode] = useState<CurrencyCode>("USD");
  const [availableCurrencies, setAvailableCurrenciesState] = useState<CurrencyInfo[]>([
    CURRENCIES.USD,
    CURRENCIES.SAR,
    CURRENCIES.YER,
  ]);

  const activeCurrency = CURRENCIES[activeCurrencyCode];

  const setActiveCurrency = (code: CurrencyCode) => {
    setActiveCurrencyCode(code);
  };

  const setAvailableCurrencies = (currencies: CurrencyInfo[]) => {
    setAvailableCurrenciesState(currencies);
    if (!currencies.find(c => c.code === activeCurrencyCode)) {
      if (currencies.length > 0) setActiveCurrencyCode(currencies[0].code);
    }
  };

  const format = (usdAmount: number): string => {
    const converted = usdAmount * activeCurrency.rate;
    return `${activeCurrency.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrency, availableCurrencies, setAvailableCurrencies, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
