import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import { ShoppingBag, Home, Search, ChevronDown, X } from "lucide-react";
import { useGetStore, getGetStoreQueryKey } from "@workspace/api-client-react";
import { MiniCart } from "@/components/store/MiniCart";
import { useEffect, useRef, useState } from "react";
import { ThemeContext, parseThemeConfig } from "@/context/theme-context";

export function StoreLayout({ children, storeSlug }: { children: React.ReactNode; storeSlug: string }) {
  const { totalItems } = useCart();
  const { data: store, isLoading } = useGetStore(storeSlug, {
    query: { queryKey: getGetStoreQueryKey(storeSlug), enabled: !!storeSlug },
  });
  const [location] = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { activeCurrency, setActiveCurrency, availableCurrencies, setAvailableCurrencies } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const currencyRef = useRef<HTMLDivElement>(null);

  const theme = parseThemeConfig(store?.themeConfig);

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
    if (store.secondaryColor) {
      document.documentElement.style.setProperty("--store-surface", store.secondaryColor);
    }
  }, [store]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="w-24 h-3 bg-gray-100 rounded-full animate-pulse" />
          <div className="w-16 h-2 bg-gray-50 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-lg">Store not found</div>;
  }

  const navbarStyle = theme.navbarStyle;
  const primaryColor = store.primaryColor || "#C1121F";

  const navbarBg =
    navbarStyle === "colored" ? primaryColor :
    navbarStyle === "transparent" ? "transparent" : "#ffffff";

  const navbarTextColor =
    navbarStyle === "colored" ? "#ffffff" :
    navbarStyle === "transparent" ? "#ffffff" : "#111827";

  const isNavbarLight = navbarStyle === "white";

  return (
    <ThemeContext.Provider value={theme}>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col relative shadow-2xl overflow-hidden border-x border-gray-100"
        style={{ background: "#f9f9f9" }}
      >
        {/* Announcement Bar */}
        {theme.announcementBar && announcementVisible && (
          <div
            className="relative flex items-center justify-center px-8 py-2.5 text-sm font-semibold text-center"
            style={{ background: theme.announcementBarBg, color: theme.announcementBarText }}
          >
            <span>{theme.announcementBar}</span>
            <button
              onClick={() => setAnnouncementVisible(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: theme.announcementBarText }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navbar */}
        <header
          className={`sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-all ${navbarStyle === "transparent" ? "" : "border-b"}`}
          style={{
            background: navbarBg,
            borderBottomColor: isNavbarLight ? "rgba(0,0,0,0.06)" : "transparent",
            backdropFilter: "blur(16px)",
          }}
        >
          <Link href={`/store/${storeSlug}`} className="flex items-center gap-2.5">
            {store.logoImage ? (
              <img src={store.logoImage} alt={store.name} className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white"
                style={{ background: navbarStyle === "colored" ? "rgba(255,255,255,0.2)" : primaryColor }}
              >
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="font-sans text-[17px] font-black tracking-tight"
              style={{ color: navbarTextColor }}
            >
              {store.name}
            </span>
          </Link>

          <div className="flex items-center gap-2" style={{ color: navbarTextColor }}>
            {/* Currency Switcher */}
            {availableCurrencies.length > 1 && (
              <div className="relative" ref={currencyRef}>
                <button
                  onClick={() => setCurrencyOpen(v => !v)}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors"
                  style={{
                    background: isNavbarLight ? "#f3f4f6" : "rgba(255,255,255,0.15)",
                    color: navbarTextColor
                  }}
                >
                  {activeCurrency.symbol} {activeCurrency.code}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {currencyOpen && (
                  <div className={`absolute top-full mt-1.5 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-[60] min-w-[140px] ${isRTL ? "left-0" : "right-0"}`}>
                    {availableCurrencies.map(c => (
                      <button
                        key={c.code}
                        onClick={() => { setActiveCurrency(c.code); setCurrencyOpen(false); }}
                        className={`w-full px-4 py-3 text-xs font-semibold text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${activeCurrency.code === c.code ? "text-primary" : "text-gray-700"}`}
                      >
                        <span>{isRTL ? c.nameAr : c.name}</span>
                        <span className="text-gray-400">{c.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors"
              style={{
                background: isNavbarLight ? "#f3f4f6" : "rgba(255,255,255,0.15)",
                color: navbarTextColor
              }}
            >
              {language === "en" ? "عربي" : "EN"}
            </button>

            {/* Search */}
            <Link href={`/store/${storeSlug}/products`}>
              <button className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{ background: isNavbarLight ? "#f3f4f6" : "rgba(255,255,255,0.15)", color: navbarTextColor }}>
                <Search className="w-4 h-4" />
              </button>
            </Link>

            {/* Cart */}
            <Link href={`/store/${storeSlug}/cart`}>
              <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                style={{ background: isNavbarLight ? "#f3f4f6" : "rgba(255,255,255,0.15)", color: navbarTextColor }}>
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-[10px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white"
                    style={{ background: primaryColor }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-white">
          {children}
        </main>

        {/* Bottom Nav */}
        <nav className="sticky bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 pt-2.5 pb-6 flex justify-around items-center z-50">
          {[
            { href: `/store/${storeSlug}`, icon: Home, label: t.home, active: location === `/store/${storeSlug}` },
            { href: `/store/${storeSlug}/products`, icon: Search, label: t.shop, active: location.startsWith(`/store/${storeSlug}/products`) },
          ].map(({ href, icon: Icon, label, active }) => (
            <Link key={href} href={href}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${active ? "text-primary" : "text-gray-400"}`}>
              <div className={`relative w-12 h-8 flex items-center justify-center rounded-xl transition-all ${active ? "bg-primary/10" : "hover:bg-gray-100"}`}>
                <Icon className={`w-5 h-5 transition-all ${active ? "scale-110" : ""}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </Link>
          ))}

          <Link href={`/store/${storeSlug}/cart`}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${(location.includes("/cart") || location.includes("/checkout")) ? "text-primary" : "text-gray-400"}`}>
            <div className={`relative w-12 h-8 flex items-center justify-center rounded-xl transition-all ${(location.includes("/cart") || location.includes("/checkout")) ? "bg-primary/10" : "hover:bg-gray-100"}`}>
              <ShoppingBag className={`w-5 h-5 transition-all ${(location.includes("/cart") || location.includes("/checkout")) ? "scale-110" : ""}`} />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white"
                  style={{ background: primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">{t.cart}</span>
          </Link>
        </nav>

        {/* Social Footer */}
        {(theme.instagram || theme.tiktok || theme.footerText) && (
          <div className="bg-gray-50 border-t border-gray-100 px-5 py-4 flex flex-col items-center gap-2">
            {(theme.instagram || theme.tiktok) && (
              <div className="flex gap-3">
                {theme.instagram && (
                  <a href={theme.instagram} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                    📷 Instagram
                  </a>
                )}
                {theme.tiktok && (
                  <a href={theme.tiktok} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                    🎵 TikTok
                  </a>
                )}
              </div>
            )}
            {theme.footerText && (
              <p className="text-[10px] text-gray-400 text-center">{theme.footerText}</p>
            )}
          </div>
        )}

        <MiniCart storeSlug={storeSlug} />
      </div>
    </ThemeContext.Provider>
  );
}
