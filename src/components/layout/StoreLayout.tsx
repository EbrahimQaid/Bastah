import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import { ShoppingBag, Home, Search, ChevronDown, X, Sparkles, User, BadgePercent, Globe, Moon, Sun, Check } from "lucide-react";
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
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem(`darkMode`) === "true"; } catch { return false; }
  });
  const prefRef = useRef<HTMLDivElement>(null);

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
      if (prefRef.current && !prefRef.current.contains(e.target as Node)) {
        setPrefModalOpen(false);
      }
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
        <div className="min-h-screen bg-neutral-100/80 dark:bg-[#070e17] flex justify-center sm:py-4 transition-colors duration-300">
          <div
            dir={isRTL ? "rtl" : "ltr"}
            className="min-h-[100dvh] sm:min-h-[92vh] w-full max-w-md flex flex-col relative shadow-[0_12px_45px_-10px_rgba(0,0,0,0.15)] overflow-hidden sm:rounded-[32px] border sm:border-neutral-200/80 dark:sm:border-neutral-800/80"
            style={{ background: dm.bg, borderColor: dm.border, transition: "background 0.35s ease" }}
          >
            {/* Announcement Bar */}
            {theme.announcementBar && announcementVisible && (
              <div
                className="relative flex items-center justify-center px-8 py-2.5 text-xs font-bold text-center tracking-wide"
                style={{ background: theme.announcementBarBg || primaryColor, color: theme.announcementBarText || "#fff" }}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 opacity-90 animate-pulse" />
                <span>{theme.announcementBar}</span>
                <button
                  onClick={() => setAnnouncementVisible(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity p-1"
                  style={{ color: theme.announcementBarText || "#fff" }}
                  aria-label="Close announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Navbar */}
            <header
              className="sticky top-0 z-50 px-4 py-2.5 flex items-center justify-between transition-all duration-300 border-b relative"
              style={{
                background: navbarBg,
                backdropFilter: "blur(24px) saturate(190%)",
                WebkitBackdropFilter: "blur(24px) saturate(190%)",
                boxShadow: (isWhite && !isDark) ? "0 2px 14px rgba(0,0,0,0.03)" : "none",
                borderColor: dm.navbarBorder,
                transition: "background 0.35s ease",
              }}
            >
              {/* Brand Logo & Name */}
              <Link href="/store" className="flex items-center gap-2 group select-none">
                {store.logoImage ? (
                  <img
                    src={store.logoImage}
                    alt={store.name}
                    className="w-8 h-8 rounded-xl object-cover shadow-2xs group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ background: isColored ? "rgba(255,255,255,0.25)" : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
                  >
                    {store.name.charAt(0)}
                  </div>
                )}
                <span className="font-sans text-[17px] font-black tracking-tight" style={{ color: navbarTextColor }}>
                  {store.name}
                </span>
              </Link>

              {/* Action Controls - Ultra-clean, uncrowded */}
              <div className="flex items-center gap-2" style={{ color: navbarTextColor }}>
                {/* Search Button */}
                <Link href="/store/products">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95 border hover:opacity-85"
                    style={{
                      background: isWhite && !isDark ? "#f4f4f7" : "rgba(255,255,255,0.12)",
                      borderColor: isWhite && !isDark ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                      color: navbarTextColor,
                    }}
                    aria-label="Search products"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </Link>

                {/* Unified Regional Pill */}
                <div className="relative" ref={prefRef}>
                  <button
                    onClick={() => setPrefModalOpen(v => !v)}
                    className="flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1.5 rounded-full transition-all active:scale-95 border"
                    style={{
                      background: isWhite && !isDark ? "#f4f4f7" : "rgba(255,255,255,0.12)",
                      borderColor: isWhite && !isDark ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.1)",
                      color: navbarTextColor,
                    }}
                  >
                    <Globe className="w-3.5 h-3.5 opacity-80" />
                    <span>{activeCurrency.symbol}</span>
                    <span className="opacity-40">·</span>
                    <span>{language === "ar" ? "عربي" : "EN"}</span>
                  </button>

                  {/* Regional Preferences Popover Modal */}
                  {prefModalOpen && (
                    <div
                      className={`absolute top-full mt-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-slate-800 shadow-2xl rounded-2xl p-4 z-[90] w-72 text-start transition-all animate-in fade-in zoom-in-95 ${
                        isRTL ? "left-0" : "right-0"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-xs font-black text-gray-900 dark:text-white">
                            {isRTL ? "التفضيلات واللغة" : "Preferences"}
                          </h3>
                        </div>
                        <button
                          onClick={() => setPrefModalOpen(false)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Language Section */}
                      <div className="mb-3.5">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
                          {isRTL ? "اللغة" : "Language"}
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button
                            onClick={() => setLanguage("ar")}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              language === "ar"
                                ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs font-black"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                            }`}
                          >
                            {language === "ar" && <Check className="w-3 h-3" />}
                            <span>العربية</span>
                          </button>
                          <button
                            onClick={() => setLanguage("en")}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              language === "en"
                                ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs font-black"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                            }`}
                          >
                            {language === "en" && <Check className="w-3 h-3" />}
                            <span>English</span>
                          </button>
                        </div>
                      </div>

                      {/* Currency Section */}
                      <div className="mb-3.5">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
                          {isRTL ? "العملة" : "Currency"}
                        </label>
                        <div className="space-y-1">
                          {availableCurrencies.map(c => {
                            const isSelected = activeCurrency.code === c.code;
                            return (
                              <button
                                key={c.code}
                                onClick={() => {
                                  setActiveCurrency(c.code);
                                }}
                                className={`w-full py-1.5 px-2.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                                  isSelected
                                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-black border border-purple-200 dark:border-purple-800"
                                    : "hover:bg-gray-50 dark:hover:bg-slate-800/60 text-gray-700 dark:text-gray-300 font-medium"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-6 text-center font-black text-[11px] opacity-75">{c.symbol}</span>
                                  <span>{isRTL ? c.nameAr : c.name}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Dark Mode Toggle */}
                      <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          {darkMode ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                          {isRTL ? "المظهر الداكن" : "Dark Mode"}
                        </span>
                        <button
                          onClick={toggleDarkMode}
                          className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative ${
                            darkMode ? "bg-purple-600" : "bg-gray-200 dark:bg-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ease-in-out ${
                              darkMode ? (isRTL ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Button (Only shown if hideBottomNav is true OR if cart has items) */}
                {(hideBottomNav || totalItems > 0) && (
                  <Link href="/store/cart">
                    <button
                      className="relative w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-95 border"
                      style={{
                        background: `${primaryColor}14`,
                        borderColor: `${primaryColor}30`,
                        color: primaryColor,
                      }}
                      aria-label="Shopping Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span
                        className="absolute -top-1 -right-1 text-white text-[8.5px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                        style={{ background: "#ef4444" }}
                      >
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    </button>
                  </Link>
                )}
              </div>
            </header>

            {/* Main Content */}
            <main
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
              style={{ background: dm.surface, paddingBottom: hideBottomNav ? 20 : 105, transition: "background 0.35s ease" }}
            >
              {children}
            </main>

            {/* Bottom Navigation */}
            {!hideBottomNav && (
              <div
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
                  paddingBottom: 16,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                <nav
                  style={{
                    pointerEvents: "auto",
                    background: dm.bottomNavBg,
                    backdropFilter: "blur(32px) saturate(200%)",
                    WebkitBackdropFilter: "blur(32px) saturate(200%)",
                    borderRadius: 28,
                    border: `1px solid ${dm.bottomNavBorder}`,
                    boxShadow: isDark
                      ? "0 10px 40px rgba(0,0,0,0.6), 0 2px 10px rgba(0,0,0,0.4)"
                      : "0 10px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)",
                    padding: "6px 8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-around",
                    width: "100%",
                    maxWidth: 360,
                  }}
                >
                  {[
                    { href: "/store",          label: isRTL ? "الرئيسية" : "Home",     icon: Home,         active: location === "/store" },
                    { href: "/store/products", label: isRTL ? "المنتجات" : "Catalog",  icon: BadgePercent, active: location.startsWith("/store/products") },
                    { href: "/store/cart",     label: isRTL ? "السلة" : "Cart",        icon: ShoppingBag,  active: location.startsWith("/store/cart"), badge: totalItems > 0 ? totalItems : null },
                    { href: "/store/profile",  label: isRTL ? "المتجر" : "Profile",    icon: User,         active: location.startsWith("/store/profile") },
                  ].map(({ href, label, icon: Icon, active, badge }, i) => (
                    <Link key={i} href={href} style={{ textDecoration: "none" }} className="flex-1">
                      <div
                        className="flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200"
                        style={{
                          background: active ? `${primaryColor}14` : "transparent",
                          color: active ? primaryColor : dm.iconColor,
                        }}
                      >
                        <div className="relative">
                          <Icon
                            style={{
                              width: 21,
                              height: 21,
                              strokeWidth: active ? 2.3 : 1.8,
                              color: active ? primaryColor : undefined,
                              transition: "transform 0.2s ease, color 0.2s ease",
                              transform: active ? "scale(1.08)" : "scale(1)",
                            }}
                          />

                          {badge && (
                            <span
                              className="absolute -top-1.5 -right-2 text-[8px] font-black text-white px-1 py-0.2 rounded-full min-w-[14px] h-[14px] flex items-center justify-center shadow-sm"
                              style={{
                                background: "#ef4444",
                                border: "1.5px solid #fff",
                              }}
                            >
                              {badge > 9 ? "9+" : badge}
                            </span>
                          )}
                        </div>
                        <span
                          className="text-[10px] font-black mt-1 tracking-tight leading-none"
                          style={{
                            color: active ? primaryColor : undefined,
                            opacity: active ? 1 : 0.65,
                          }}
                        >
                          {label}
                        </span>
                        {active && (
                          <div
                            className="w-1 h-1 rounded-full mt-0.5"
                            style={{ background: primaryColor }}
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
            )}

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
        </div>
      </ThemeContext.Provider>
    </StoreUIContext.Provider>
  );
}
