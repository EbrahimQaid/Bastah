import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import { ShoppingBag, Home, Search, ChevronDown, X, Sparkles, User, BadgePercent } from "lucide-react";
import { useGetStore, getGetStoreQueryKey } from "@/services/api";
import { MiniCart } from "@/components/store/MiniCart";
import { useEffect, useRef, useState } from "react";
import { ThemeContext, parseThemeConfig } from "@/context/theme-context";
import { StoreUIContext } from "@/context/store-ui-context";

export function StoreLayout({ children, hideBottomNav = false }: { children: React.ReactNode; hideBottomNav?: boolean }) {
  const { totalItems } = useCart();
  const { data: store, isLoading, isError, error } = useGetStore();
  const [location] = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { activeCurrency, setActiveCurrency, availableCurrencies, setAvailableCurrencies } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem(`darkMode`) === "true"; } catch { return false; }
  });
  const currencyRef = useRef<HTMLDivElement>(null);

  const theme = parseThemeConfig(store?.themeConfig);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      try { localStorage.setItem(`darkMode`, String(next)); } catch {}
      return next;
    });
  };

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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${store.fontFamily.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
      document.head.appendChild(link);
      document.documentElement.style.setProperty("--app-font-sans", `'${store.fontFamily}', 'Tajawal', sans-serif`);
    }
    if (store.primaryColor) document.documentElement.style.setProperty("--store-primary", store.primaryColor);
    if (store.secondaryColor) document.documentElement.style.setProperty("--store-surface", store.secondaryColor);
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

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white max-w-md mx-auto border-x">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">حدث خطأ أثناء الاتصال بالخادم</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">
          {(error as Error)?.message || "يرجى التحقق من اتصال قاعدة البيانات"}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-lg">Store not found</div>;
  }

  const navbarStyle = theme.navbarStyle;
  const primaryColor = store.primaryColor || "#7C3AED";
  const isColored = navbarStyle === "colored";
  const isTransparent = navbarStyle === "transparent";
  const isDark = darkMode;
  const isWhite = !isColored && !isTransparent;
  const navbarTextColor = (isColored || isTransparent || isDark) ? "#ffffff" : "#111827";
  const navbarBg = isColored ? primaryColor : isTransparent ? "transparent" : isDark ? "rgba(13,27,42,0.97)" : "rgba(255,255,255,0.94)";

  const dm = {
    bg: isDark ? "#0d1b2a" : "#f8f8f8",
    surface: isDark ? "#16253a" : "#ffffff",
    surfaceMid: isDark ? "#1c2f45" : "#f8f8f8",
    card: isDark ? "#1e3349" : "#ffffff",
    border: isDark ? "rgba(120,180,255,0.08)" : "rgba(0,0,0,0.06)",
    navbarBorder: isDark ? "rgba(120,180,255,0.07)" : "rgba(0,0,0,0.05)",
    bottomNavBg: isDark ? "rgba(13,27,42,0.92)" : "rgba(255,255,255,0.72)",
    bottomNavBorder: isDark ? "rgba(120,180,255,0.12)" : "rgba(255,255,255,0.85)",
    iconColor: isDark ? "#a8c8f0" : "#1c1c2e",
    text: isDark ? "#e2eefc" : "#111827",
    textMuted: isDark ? "#7aaacf" : "#6b7280",
  };

  const cartActive = location.includes("/cart") || location.includes("/checkout");

  return (
    <StoreUIContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeContext.Provider value={theme}>
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col relative shadow-2xl overflow-hidden border-x"
          style={{ background: dm.bg, borderColor: dm.border, transition: "background 0.35s ease" }}
        >
          {/* Announcement Bar */}
          {theme.announcementBar && announcementVisible && (
            <div
              className="relative flex items-center justify-center px-10 py-2.5 text-xs font-bold text-center"
              style={{ background: theme.announcementBarBg || primaryColor, color: theme.announcementBarText || "#fff" }}
            >
              <Sparkles className="w-3 h-3 mr-1.5 opacity-80" />
              <span>{theme.announcementBar}</span>
              <button
                onClick={() => setAnnouncementVisible(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: theme.announcementBarText || "#fff" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Navbar */}
          <header
            className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-all duration-300 border-b"
            style={{
              background: navbarBg,
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: (isWhite && !isDark) ? "0 1px 20px rgba(0,0,0,0.05)" : "none",
              borderColor: dm.navbarBorder,
              transition: "background 0.35s ease",
            }}
          >
            <Link href="/store" className="flex items-center gap-2.5">
              {store.logoImage ? (
                <img src={store.logoImage} alt={store.name} className="w-9 h-9 rounded-xl object-cover shadow-sm" />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white"
                  style={{ background: isColored ? "rgba(255,255,255,0.22)" : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                >
                  {store.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-sans text-[17px] font-black tracking-tight" style={{ color: navbarTextColor }}>
                {store.name}
              </span>
            </Link>

            <div className="flex items-center gap-1.5" style={{ color: navbarTextColor }}>
              {availableCurrencies.length > 1 && (
                <div className="relative" ref={currencyRef}>
                  <button
                    onClick={() => setCurrencyOpen(v => !v)}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors"
                    style={{ background: isWhite && !isDark ? "#f3f4f6" : "rgba(255,255,255,0.18)", color: navbarTextColor }}
                  >
                    {activeCurrency.symbol} {activeCurrency.code}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  {currencyOpen && (
                    <div className={`absolute top-full mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-[60] min-w-[150px] ${isRTL ? "left-0" : "right-0"}`}>
                      {availableCurrencies.map(c => (
                        <button
                          key={c.code}
                          onClick={() => { setActiveCurrency(c.code); setCurrencyOpen(false); }}
                          className="w-full px-4 py-3 text-xs font-semibold flex items-center justify-between hover:bg-gray-50 transition-colors text-gray-600"
                          style={activeCurrency.code === c.code ? { color: primaryColor } : {}}
                        >
                          <span>{isRTL ? c.nameAr : c.name}</span>
                          <span className="text-gray-400 font-bold">{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="text-xs font-bold px-2.5 py-1.5 rounded-full transition-colors"
                style={{ background: isWhite && !isDark ? "#f3f4f6" : "rgba(255,255,255,0.18)", color: navbarTextColor }}
              >
                {language === "en" ? "عربي" : "EN"}
              </button>

              <Link href="/store/products">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
                  style={{ background: isWhite && !isDark ? "#f3f4f6" : "rgba(255,255,255,0.18)", color: navbarTextColor }}
                >
                  <Search className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/store/cart">
                <button
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105"
                  style={{
                    background: totalItems > 0 ? `${primaryColor}18` : isWhite && !isDark ? "#f3f4f6" : "rgba(255,255,255,0.18)",
                    color: totalItems > 0 ? primaryColor : navbarTextColor,
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                      style={{ background: primaryColor }}
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ background: dm.surface, paddingBottom: 100, transition: "background 0.35s ease" }}
          >
            {children}
          </main>

          {/* Bottom Navigation */}
          {!hideBottomNav && <div
            style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              maxWidth: 448,
              width: "100%",
              zIndex: 50,
              pointerEvents: "none",
              display: "flex",
              justifyContent: "center",
              paddingBottom: 22,
            }}
          >
            <nav
              style={{
                pointerEvents: "auto",
                background: dm.bottomNavBg,
                backdropFilter: "blur(36px) saturate(200%)",
                WebkitBackdropFilter: "blur(36px) saturate(200%)",
                borderRadius: 36,
                border: `1px solid ${dm.bottomNavBorder}`,
                boxShadow: isDark
                  ? "0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
                  : "0 8px 40px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                gap: 4,
                overflow: "visible",
              }}
            >
              {[
                { href: "/store",          icon: Home,         active: location === "/store" },
                { href: "/store/products", icon: BadgePercent, active: location.startsWith("/store/products") },
                { href: "/store/cart",     icon: ShoppingBag,  active: location.startsWith("/store/cart"), badge: totalItems > 0 ? totalItems : null },
                { href: "/store/profile",  icon: User,         active: location.startsWith("/store/profile") },
              ].map(({ href, icon: Icon, active, badge }, i) => (
                <Link key={i} href={href} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{
                      position: "relative",
                      width: 58,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      style={{
                        width: 25,
                        height: 25,
                        color: active ? primaryColor : dm.iconColor,
                        strokeWidth: 1.8,
                        transition: "color 0.25s ease",
                      }}
                    />

                    {badge && (
                      <span
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: "#ef4444",
                          border: "2px solid rgba(255,255,255,0.9)",
                          fontSize: 7,
                          fontWeight: 900,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {badge > 9 ? "9+" : badge}
                      </span>
                    )}

                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: -20,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: primaryColor,
                          boxShadow: `0 4px 14px ${primaryColor}70`,
                          transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                        }}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </nav>
          </div>}

          {/* Social Footer */}
          {(theme.instagram || theme.tiktok || theme.footerText) && (
            <div className="px-5 py-4 flex flex-col items-center gap-2 border-t"
              style={{ background: dm.surfaceMid, borderColor: dm.border }}>
              {(theme.instagram || theme.tiktok) && (
                <div className="flex gap-4">
                  {theme.instagram && (
                    <a href={theme.instagram} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                      📷 Instagram
                    </a>
                  )}
                  {theme.tiktok && (
                    <a href={theme.tiktok} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                      🎵 TikTok
                    </a>
                  )}
                </div>
              )}
              {theme.footerText && <p className="text-[10px] text-gray-400 text-center">{theme.footerText}</p>}
            </div>
          )}

          <MiniCart />
        </div>
      </ThemeContext.Provider>
    </StoreUIContext.Provider>
  );
}
