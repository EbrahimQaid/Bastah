import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import { ShoppingBag, Home, Search, ChevronDown } from "lucide-react";
import { useGetStore, getGetStoreQueryKey } from "@workspace/api-client-react";
import { MiniCart } from "@/components/store/MiniCart";
import { useEffect, useRef, useState } from "react";

export function StoreLayout({ children, storeSlug }: { children: React.ReactNode; storeSlug: string }) {
  const { totalItems } = useCart();
  const { data: store, isLoading } = useGetStore(storeSlug, {
    query: { queryKey: getGetStoreQueryKey(storeSlug), enabled: !!storeSlug },
  });
  const [location] = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { activeCurrency, setActiveCurrency, availableCurrencies, setAvailableCurrencies } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!store) return;
    if (store.currencies) {
      try {
        const codes: CurrencyCode[] = JSON.parse(store.currencies);
        const filtered = codes.map(c => CURRENCIES[c]).filter(Boolean);
        if (filtered.length > 0) {
          setAvailableCurrencies(filtered);
          if (store.defaultCurrency && CURRENCIES[store.defaultCurrency as CurrencyCode]) {
            setActiveCurrency(store.defaultCurrency as CurrencyCode);
          }
        }
      } catch {}
    }
    if (store.fontFamily) {
      document.documentElement.style.setProperty("--app-font-sans", `'${store.fontFamily}', 'Inter', sans-serif`);
    }
    if (store.primaryColor) {
      document.documentElement.style.setProperty("--store-primary", store.primaryColor);
    }
  }, [store]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted"></div>
          <div className="w-32 h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-lg">Store not found</div>;
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-[100dvh] w-full max-w-md mx-auto bg-background flex flex-col relative shadow-2xl overflow-hidden border-x border-border/20"
    >
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between transition-all shadow-sm">
        <Link href={`/store/${storeSlug}`} className="flex items-center gap-2.5">
          {store.logoImage && (
            <img src={store.logoImage} alt={store.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
          )}
          <span className="font-sans text-lg font-black tracking-tight text-foreground">
            {store.name}
          </span>
        </Link>

        <div className="flex items-center gap-2.5 text-foreground">
          {/* Currency Switcher */}
          {availableCurrencies.length > 1 && (
            <div className="relative" ref={currencyRef}>
              <button
                onClick={() => setCurrencyOpen(v => !v)}
                className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-full border border-border/60 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {activeCurrency.symbol} {activeCurrency.code}
                <ChevronDown className="w-3 h-3" />
              </button>
              {currencyOpen && (
                <div className={`absolute top-full mt-1.5 bg-white border border-border shadow-lg rounded-xl overflow-hidden z-[60] min-w-[120px] ${isRTL ? "left-0" : "right-0"}`}>
                  {availableCurrencies.map(c => (
                    <button
                      key={c.code}
                      onClick={() => { setActiveCurrency(c.code); setCurrencyOpen(false); }}
                      className={`w-full px-3 py-2.5 text-xs font-semibold text-left flex items-center justify-between hover:bg-surface transition-colors ${activeCurrency.code === c.code ? "text-primary bg-surface" : "text-foreground"}`}
                    >
                      <span>{isRTL ? c.nameAr : c.name}</span>
                      <span className="text-muted-foreground">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded-full border border-border/60 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {language === "en" ? "عربي" : "EN"}
          </button>

          <Link href={`/store/${storeSlug}/products`}>
            <Search className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
          </Link>

          <Link href={`/store/${storeSlug}/cart`} className="relative hover:text-primary transition-colors cursor-pointer">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        {children}
      </main>

      <nav className="sticky bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-border/40 px-6 pt-3 pb-5 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <Link href={`/store/${storeSlug}`} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${location === `/store/${storeSlug}` ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <Home className={`w-6 h-6 transition-all ${location === `/store/${storeSlug}` ? "scale-110" : ""}`} />
            {location === `/store/${storeSlug}` && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{t.home}</span>
        </Link>
        <Link href={`/store/${storeSlug}/products`} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${location.includes('/products') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <Search className={`w-6 h-6 transition-all ${location.includes('/products') ? "scale-110" : ""}`} />
            {location.includes('/products') && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{t.shop}</span>
        </Link>
        <Link href={`/store/${storeSlug}/cart`} className={`flex flex-col items-center gap-1.5 transition-colors relative p-2 ${location.includes('/cart') || location.includes('/checkout') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <ShoppingBag className={`w-6 h-6 transition-all ${location.includes('/cart') || location.includes('/checkout') ? "scale-110" : ""}`} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
            {(location.includes('/cart') || location.includes('/checkout')) && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{t.cart}</span>
        </Link>
      </nav>

      <MiniCart storeSlug={storeSlug} />
    </div>
  );
}
