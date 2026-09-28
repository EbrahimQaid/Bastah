import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import {
  ShoppingBag,
  Home,
  Search,
  X,
  Sparkles,
  User,
  BadgePercent,
  Globe,
  Moon,
  Sun,
  Check,
  Laptop,
  Truck,
  ShieldCheck,
  Phone,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Store,
} from "lucide-react";
import { useGetStore } from "@/services/api";
import { MiniCart } from "@/components/store/MiniCart";
import { useEffect, useRef, useState } from "react";
import { ThemeContext, parseThemeConfig } from "@/context/theme-context";
import { StoreUIContext, ThemeMode } from "@/context/store-ui-context";
import DukkaniLogo from "@/components/ui/DukkaniLogo";

export function StoreLayout({
  children,
  hideBottomNav = false,
}: {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}) {
  const { totalItems, totalPrice, openMiniCart } = useCart();
  const { data: store, isLoading, isError, error } = useGetStore();
  const [location] = useLocation();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { activeCurrency, setActiveCurrency, availableCurrencies, setAvailableCurrencies, format } = useCurrency();
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const prefRef = useRef<HTMLDivElement>(null);
  const theme = parseThemeConfig(store?.themeConfig);

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem("store_theme_mode") as ThemeMode | null;
      if (saved && ["light", "dark", "system"].includes(saved)) {
        return saved;
      }
      const legacy = localStorage.getItem("darkMode");
      if (legacy === "true") return "dark";
      if (legacy === "false") return "light";
    } catch {}
    return "system";
  });

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const isDark = themeMode === "dark" || (themeMode === "system" && systemDark);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem("store_theme_mode", mode);
      const computedDark = mode === "dark" || (mode === "system" && systemDark);
      localStorage.setItem("darkMode", String(computedDark));
    } catch {}
  };

  const toggleDarkMode = () => {
    setThemeMode(isDark ? "light" : "dark");
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (!store) return;
    if (store.currencies) {
      try {
        const codes: CurrencyCode[] = JSON.parse(store.currencies);
        const filtered = codes.map((c) => CURRENCIES[c]).filter(Boolean);
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
      document.documentElement.style.setProperty(
        "--app-font-sans",
        `'${store.fontFamily}', 'Tajawal', sans-serif`,
      );
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
      <div className="min-h-screen w-full bg-neutral-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 animate-pulse flex items-center justify-center text-red-600">
            <ShoppingBag className="w-6 h-6 animate-bounce" />
          </div>
          <div className="w-32 h-3 bg-neutral-200 dark:bg-zinc-800 rounded-full animate-pulse" />
          <div className="w-20 h-2 bg-neutral-100 dark:bg-zinc-900 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    const rawErrorMessage = (error as Error)?.message || "";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-zinc-950">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/50 rounded-2xl flex items-center justify-center mb-4 text-[#991B1B]">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
          حدث خطأ أثناء تحميل بيانات المتجر
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4 leading-relaxed">
          {rawErrorMessage || "يرجى التحقق من اتصال الخادم وإعادة المحاولة"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-lg text-gray-500">
        المتجر غير متاح حالياً
      </div>
    );
  }

  const primaryColor =
    store.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

  const storeDisplayName =
    store.name &&
    !store.name.includes("بسطة") &&
    !store.name.includes("بَسطة") &&
    !store.name.toLowerCase().includes("bastah")
      ? store.name
      : "دكاني - Dukkani";

  const isOldBastahLogo =
    !store.logoImage ||
    (typeof store.logoImage === "string" && store.logoImage.toLowerCase().includes("bastah")) ||
    store.name?.includes("بسطة") ||
    store.name?.includes("بَسطة");

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <StoreUIContext.Provider
      value={{ themeMode, setThemeMode, isDark, darkMode: isDark, toggleDarkMode }}
    >
      <ThemeContext.Provider value={theme}>
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="min-h-screen flex flex-col bg-neutral-50/60 dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 transition-colors duration-300"
        >
          {/* Top Promotional Announcement Bar */}
          {theme.announcementBar && announcementVisible && (
            <div
              className="relative flex items-center justify-center px-6 py-2 text-xs font-semibold tracking-wide text-white"
              style={{
                background: theme.announcementBarBg || primaryColor,
                color: theme.announcementBarText || "#ffffff",
              }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 opacity-90 animate-pulse" />
                <span>{theme.announcementBar}</span>
              </div>
              <button
                onClick={() => setAnnouncementVisible(false)}
                className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 opacity-75 hover:opacity-100 p-1"
                aria-label="Close announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Top Bar Contract (Strict 3-Zone Architecture) ── */}
          <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-zinc-800/80 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
              {/* Zone 1: Single element Brand Wordmark & Icon */}
              <div className="flex items-center gap-4 shrink-0">
                <Link href="/store" className="flex items-center gap-2.5 group select-none">
                  {!isOldBastahLogo && store.logoImage ? (
                    <img
                      src={store.logoImage}
                      alt={storeDisplayName}
                      className="w-9 h-9 rounded-xl object-cover shadow-xs group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <DukkaniLogo iconOnly size="sm" />
                  )}
                  <span className="font-sans text-lg sm:text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                    {storeDisplayName}
                  </span>
                </Link>
              </div>

              {/* Zone 2: 4-5 Clean Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600 dark:text-zinc-300">
                <Link
                  href="/store"
                  className={`transition-colors hover:text-neutral-900 dark:hover:text-white ${
                    location === "/store" ? "font-bold text-neutral-900 dark:text-white" : ""
                  }`}
                >
                  {isRTL ? "الرئيسية" : "Home"}
                </Link>
                <Link
                  href="/store/products"
                  className={`transition-colors hover:text-neutral-900 dark:hover:text-white ${
                    location.startsWith("/store/products")
                      ? "font-bold text-neutral-900 dark:text-white"
                      : ""
                  }`}
                >
                  {isRTL ? "جميع المنتجات" : "All Products"}
                </Link>
                <Link
                  href="/store/cart"
                  className={`transition-colors hover:text-neutral-900 dark:hover:text-white ${
                    location.startsWith("/store/cart")
                      ? "font-bold text-neutral-900 dark:text-white"
                      : ""
                  }`}
                >
                  {isRTL ? "سلة الشراء" : "Shopping Bag"}
                </Link>
                <Link
                  href="/store/profile"
                  className={`transition-colors hover:text-neutral-900 dark:hover:text-white ${
                    location.startsWith("/store/profile")
                      ? "font-bold text-neutral-900 dark:text-white"
                      : ""
                  }`}
                >
                  {isRTL ? "عن المتجر" : "About Store"}
                </Link>
              </nav>

              {/* Zone 3: Primary Action Controls */}
              <div className="flex items-center gap-2.5">
                {/* Search Shortcut */}
                <Link href="/store/products">
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-neutral-700 dark:text-zinc-300 transition-colors"
                    aria-label="Search catalog"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </Link>

                {/* Unified Regional & Theme Popover Trigger */}
                <div className="relative" ref={prefRef}>
                  <button
                    onClick={() => setPrefModalOpen((v) => !v)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-neutral-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
                    aria-label="Language, currency and theme settings"
                  >
                    <Globe className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{activeCurrency.symbol}</span>
                    <span className="opacity-40">·</span>
                    <span>{language === "ar" ? "عربي" : "EN"}</span>
                  </button>

                  {/* Popover Panel */}
                  {prefModalOpen && (
                    <div
                      className={`absolute top-full mt-2.5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-xl rounded-2xl p-4 z-50 w-72 text-start transition-all animate-in fade-in zoom-in-95 ${
                        isRTL ? "left-0" : "right-0"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-zinc-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                          <h3 className="text-xs font-bold text-neutral-900 dark:text-white">
                            {isRTL ? "التفضيلات الإقليمية" : "Preferences"}
                          </h3>
                        </div>
                        <button
                          onClick={() => setPrefModalOpen(false)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Language Selection */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                          {isRTL ? "اللغة" : "Language"}
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 bg-neutral-100 dark:bg-zinc-800 p-1 rounded-xl">
                          <button
                            onClick={() => setLanguage("ar")}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              language === "ar"
                                ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs font-bold"
                                : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900"
                            }`}
                          >
                            {language === "ar" && <Check className="w-3 h-3 text-red-600" />}
                            <span>العربية</span>
                          </button>
                          <button
                            onClick={() => setLanguage("en")}
                            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                              language === "en"
                                ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs font-bold"
                                : "text-neutral-600 dark:text-zinc-400 hover:text-neutral-900"
                            }`}
                          >
                            {language === "en" && <Check className="w-3 h-3 text-red-600" />}
                            <span>English</span>
                          </button>
                        </div>
                      </div>

                      {/* Currency Selection */}
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                          {isRTL ? "العملة" : "Currency"}
                        </span>
                        <div className="space-y-1 max-h-36 overflow-y-auto">
                          {availableCurrencies.map((c) => {
                            const isSelected = activeCurrency.code === c.code;
                            return (
                              <button
                                key={c.code}
                                onClick={() => setActiveCurrency(c.code)}
                                className={`w-full py-1.5 px-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                  isSelected
                                    ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold"
                                    : "hover:bg-neutral-50 dark:hover:bg-zinc-800/60 text-neutral-700 dark:text-zinc-300"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs opacity-75">{c.symbol}</span>
                                  <span>{isRTL ? c.nameAr : c.name}</span>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Theme Selection: Light / Dark / System */}
                      <div className="pt-3 border-t border-neutral-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                          {isRTL ? "المظهر" : "Appearance"}
                        </span>
                        <div className="grid grid-cols-3 gap-1 bg-neutral-100 dark:bg-zinc-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setThemeMode("light")}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              themeMode === "light"
                                ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs font-bold"
                                : "text-neutral-600 dark:text-zinc-400"
                            }`}
                          >
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[11px]">{isRTL ? "فاتح" : "Light"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setThemeMode("dark")}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              themeMode === "dark"
                                ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs font-bold"
                                : "text-neutral-600 dark:text-zinc-400"
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[11px]">{isRTL ? "داكن" : "Dark"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setThemeMode("system")}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              themeMode === "system"
                                ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs font-bold"
                                : "text-neutral-600 dark:text-zinc-400"
                            }`}
                          >
                            <Laptop className="w-3.5 h-3.5 text-sky-500" />
                            <span className="text-[11px]">{isRTL ? "تلقائي" : "Auto"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shopping Bag Button with Live Counter */}
                <button
                  onClick={openMiniCart}
                  className="relative h-9 px-3.5 flex items-center gap-2 rounded-xl text-white font-bold text-xs transition-transform active:scale-95 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #DC2626)`,
                  }}
                  aria-label="Shopping Cart Drawer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline font-mono tabular-nums">
                    {totalItems > 0 ? format(totalPrice) : (isRTL ? "السلة" : "Bag")}
                  </span>
                  {totalItems > 0 && (
                    <span className="w-5 h-5 rounded-full bg-white text-neutral-900 font-black text-[10px] flex items-center justify-center shadow-xs">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* ── Main Content Container ── */}
          <main className="flex-1 w-full pb-16 md:pb-8">{children}</main>

          {/* ── Desktop & Tablet Full Store Footer ── */}
          <footer className="border-t border-neutral-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 text-neutral-600 dark:text-zinc-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
                {/* Col 1: Store Brand & Story */}
                <div className="md:col-span-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <DukkaniLogo iconOnly size="sm" />
                    <span className="font-sans text-xl font-black text-neutral-900 dark:text-white">
                      {storeDisplayName}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-500 dark:text-zinc-400">
                    {store.description ||
                      (isRTL
                        ? "منصة تسوق رقمية موثوقة تقدم منتجات منتقاة بعناية مع التزام تام بالجودة العالية وتوصيل فائق السرعة."
                        : "A trusted digital retail destination offering carefully curated products with exceptional quality and fast delivery.")}
                  </p>
                  {store.whatsappNumber && (
                    <a
                      href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{isRTL ? "خدمة العملاء عبر واتساب" : "WhatsApp Customer Care"}</span>
                    </a>
                  )}
                </div>

                {/* Col 2: Navigation Links */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
                    {isRTL ? "روابط سريعة" : "Quick Links"}
                  </h4>
                  <ul className="space-y-2.5 text-xs font-medium">
                    <li>
                      <Link href="/store" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                        {isRTL ? "الصفحة الرئيسية" : "Storefront Home"}
                      </Link>
                    </li>
                    <li>
                      <Link href="/store/products" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                        {isRTL ? "كتالوج المنتجات" : "Product Catalog"}
                      </Link>
                    </li>
                    <li>
                      <Link href="/store/cart" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                        {isRTL ? "سلة المشتريات" : "Shopping Bag"}
                      </Link>
                    </li>
                    <li>
                      <Link href="/store/profile" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                        {isRTL ? "عن المتجر والشروط" : "About & Terms"}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Col 3: Customer Reassurance */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
                    {isRTL ? "سياسات وضمانات" : "Trust & Policies"}
                  </h4>
                  <ul className="space-y-2.5 text-xs font-medium">
                    <li className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{isRTL ? "شحن سريع لكافة المدن" : "Fast Domestic Delivery"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{isRTL ? "استرجاع واستبدال خلال 14 يوماً" : "14-Day Flexible Returns"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{isRTL ? "منتجات أصلية 100% ومضمونة" : "100% Genuine Guaranteed"}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{isRTL ? "دفع عند الاستلام متاح" : "Cash on Delivery Available"}</span>
                    </li>
                  </ul>
                </div>

                {/* Col 4: Customer Care & Assurance */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-4">
                    {isRTL ? "خدمة العملاء والضمان" : "Customer Care & Assurance"}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 leading-relaxed mb-4">
                    {isRTL
                      ? "فريق الدعم متاح طوال أيام الأسبوع للإجابة على استفساراتكم ومتابعة شحناتكم حتى باب المنزل."
                      : "Our dedicated support team is available weekly to assist with inquiries, custom sizing, and seamless order delivery."}
                  </p>
                  <div className="space-y-2 text-xs text-neutral-600 dark:text-zinc-300">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isRTL ? "فحص الجودة قبل الشحن" : "Quality Inspected Before Dispatch"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{isRTL ? "استبدال واسترجاع ميسر" : "Hassle-Free Exchange & Returns"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Copyright & Security note */}
              <div className="mt-12 pt-6 border-t border-neutral-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
                <p>
                  © {new Date().getFullYear()} {storeDisplayName}. {isRTL ? "جميع الحقوق محفوظة." : "All rights reserved."}
                </p>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>{isRTL ? "تسوق آمن ومحمي" : "Secure Checkout"}</span>
                  <span>·</span>
                  <span>{isRTL ? "دفع عند الاستلام" : "Cash on Delivery"}</span>
                  <span>·</span>
                  <Link
                    href="/login"
                    className="hover:text-neutral-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    {isRTL ? "دخول التاجر" : "Merchant Login"}
                  </Link>
                </div>
              </div>
            </div>
          </footer>

          {/* ── Native Mobile Bottom Navigation Bar (Hidden on Desktop md:hidden) ── */}
          {!hideBottomNav && (
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-neutral-200/80 dark:border-zinc-800/80 px-2 py-1 safe-area-pb">
              <nav className="flex items-center justify-around h-14">
                {[
                  {
                    href: "/store",
                    label: isRTL ? "الرئيسية" : "Home",
                    icon: Home,
                    active: location === "/store",
                  },
                  {
                    href: "/store/products",
                    label: isRTL ? "المنتجات" : "Catalog",
                    icon: BadgePercent,
                    active: location.startsWith("/store/products"),
                  },
                  {
                    href: "/store/cart",
                    label: isRTL ? "السلة" : "Bag",
                    icon: ShoppingBag,
                    active: location.startsWith("/store/cart") || location.startsWith("/store/checkout"),
                    badge: totalItems > 0 ? totalItems : null,
                  },
                  {
                    href: "/store/profile",
                    label: isRTL ? "المتجر" : "About",
                    icon: User,
                    active: location.startsWith("/store/profile"),
                  },
                ].map(({ href, label, icon: Icon, active, badge }, i) => (
                  <Link key={i} href={href} className="flex-1 py-1 text-center">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="relative">
                        <Icon
                          className={`w-5 h-5 transition-transform ${
                            active
                              ? "text-red-600 scale-110"
                              : "text-neutral-500 dark:text-zinc-400"
                          }`}
                          style={active ? { color: primaryColor } : {}}
                        />
                        {badge && (
                          <span className="absolute -top-1 -right-2 text-[9px] font-black text-white px-1.5 py-0.2 rounded-full min-w-[16px] h-4 flex items-center justify-center bg-red-600 shadow-xs">
                            {badge > 99 ? "99+" : badge}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold tracking-tight ${
                          active
                            ? "text-red-600 font-extrabold"
                            : "text-neutral-500 dark:text-zinc-400"
                        }`}
                        style={active ? { color: primaryColor } : {}}
                      >
                        {label}
                      </span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* MiniCart Slide-Over Drawer */}
          <MiniCart />
        </div>
      </ThemeContext.Provider>
    </StoreUIContext.Provider>
  );
}
