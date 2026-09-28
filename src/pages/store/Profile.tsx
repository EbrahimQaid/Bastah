import { Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStore } from "@/services/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CurrencyCode } from "@/context/currency-context";
import { useStoreUI, ThemeMode } from "@/context/store-ui-context";
import DukkaniLogo from "@/components/ui/DukkaniLogo";
import {
  MessageCircle,
  Globe,
  ShoppingBag,
  Moon,
  Sun,
  Check,
  Laptop,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";

function ProfileContent() {
  const { data: store } = useGetStore();
  const { language, setLanguage, isRTL } = useLanguage();
  const { activeCurrency, setActiveCurrency, availableCurrencies } = useCurrency();
  const { themeMode, setThemeMode, isDark } = useStoreUI();

  const primaryColor =
    store?.primaryColor &&
    store.primaryColor !== "#7C3AED" &&
    store.primaryColor !== "#6366F1" &&
    store.primaryColor?.toLowerCase() !== "#7c3aed"
      ? store.primaryColor
      : "#991B1B";

  const storeDisplayName =
    store?.name &&
    !store.name.includes("بسطة") &&
    !store.name.includes("بَسطة") &&
    !store.name.toLowerCase().includes("bastah")
      ? store.name
      : "دكاني - Dukkani";

  const isOldBastahLogo =
    !store?.logoImage ||
    (typeof store.logoImage === "string" && store.logoImage.toLowerCase().includes("bastah")) ||
    store?.name?.includes("بسطة") ||
    store?.name?.includes("بَسطة");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Store Header Card ── */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
        <div
          className="relative h-44 sm:h-52 w-full flex items-end justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}dd 0%, #1e1e24 100%)`,
          }}
        >
          {store?.coverImage && (
            <img
              src={store.coverImage}
              alt="Store Cover"
              className="absolute inset-0 w-full h-full object-cover opacity-35"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        <div className="px-6 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 gap-4 text-center sm:text-start">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-xl overflow-hidden flex items-center justify-center">
                {!isOldBastahLogo && store?.logoImage ? (
                  <img src={store.logoImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <DukkaniLogo size="lg" iconOnly />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
                    {storeDisplayName}
                  </h1>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-600" />
                    <span>{isRTL ? "متجر معتمد" : "Verified Store"}</span>
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-md">
                  {store?.description ||
                    (isRTL
                      ? "دكانك الرقمي بين يديك - نخبة المنتجات الفاخرة بجودة استثنائية."
                      : "Your digital store in your hands.")}
                </p>
              </div>
            </div>

            <Link href="/store/products">
              <button
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm transition-transform active:scale-95"
                style={{ background: primaryColor }}
              >
                {isRTL ? "استعراض المنتجات" : "View Products"}
              </button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-neutral-100 dark:border-zinc-800 text-center">
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-zinc-800/50">
              <span className="font-mono font-bold text-lg text-neutral-900 dark:text-white block">
                100%
              </span>
              <span className="text-[11px] text-neutral-400">
                {isRTL ? "جودة أصلية" : "Authentic"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-zinc-800/50">
              <span className="font-mono font-bold text-lg text-neutral-900 dark:text-white block">
                24/7
              </span>
              <span className="text-[11px] text-neutral-400">
                {isRTL ? "دعم واستجابة" : "Support"}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-zinc-800/50">
              <span className="font-mono font-bold text-lg text-neutral-900 dark:text-white block">
                14 {isRTL ? "يوم" : "Days"}
              </span>
              <span className="text-[11px] text-neutral-400">
                {isRTL ? "استبدال واسترجاع" : "Return Guarantee"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Customer Service Channels ── */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 p-6 space-y-4">
        <h2 className="font-bold text-sm text-neutral-900 dark:text-white">
          {isRTL ? "قنوات التواصل وخدمة العملاء" : "Customer Support Channels"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {store?.whatsappNumber && (
            <a
              href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-green-50/60 dark:bg-green-950/20 border border-green-200/60 dark:border-green-800/40 flex items-center gap-3.5 hover:bg-green-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-neutral-900 dark:text-white">
                  {isRTL ? "محادثة مباشرة عبر واتساب" : "Live Chat via WhatsApp"}
                </p>
                <p className="text-[11px] text-neutral-500 font-mono" dir="ltr">
                  {store.whatsappNumber}
                </p>
              </div>
            </a>
          )}

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200/70 dark:border-zinc-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-zinc-700 text-neutral-700 dark:text-zinc-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-neutral-900 dark:text-white">
                {isRTL ? "ضمان تجربة الشراء" : "Purchase Guarantee"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {isRTL ? "استبدال واسترجاع مجاني خلال 14 يوماً" : "Free returns and full refunds"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Regional & Theme Preferences ── */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800/80 p-6 space-y-6">
        <h2 className="font-bold text-sm text-neutral-900 dark:text-white pb-3 border-b border-neutral-100 dark:border-zinc-800">
          {isRTL ? "تخصيص العرض واللغة" : "Appearance & Regional Settings"}
        </h2>

        {/* Language Selection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-neutral-600 dark:text-zinc-300">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900 dark:text-white">
                {isRTL ? "لغة الواجهة" : "Interface Language"}
              </p>
              <p className="text-[11px] text-neutral-400">
                {language === "ar" ? "العربية (Arabic)" : "English"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setLanguage("ar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                language === "ar"
                  ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500"
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                language === "en"
                  ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-500"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-zinc-800">
          <div>
            <p className="text-xs font-bold text-neutral-900 dark:text-white">
              {isRTL ? "العملة النشطة" : "Active Currency"}
            </p>
            <p className="text-[11px] text-neutral-400">{activeCurrency.name}</p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-zinc-800 p-1 rounded-xl">
            {availableCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => setActiveCurrency(c.code as CurrencyCode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                  activeCurrency.code === c.code
                    ? "bg-white dark:bg-zinc-700 text-neutral-900 dark:text-white shadow-xs"
                    : "text-neutral-500"
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode Toggle */}
        <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 space-y-2">
          <p className="text-xs font-bold text-neutral-900 dark:text-white">
            {isRTL ? "نمط المظهر (فاتح / داكن)" : "Color Scheme"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setThemeMode("light")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                themeMode === "light"
                  ? "border-neutral-900 bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white"
                  : "border-neutral-200 dark:border-zinc-800 text-neutral-500"
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{isRTL ? "فاتح" : "Light"}</span>
            </button>

            <button
              onClick={() => setThemeMode("dark")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                themeMode === "dark"
                  ? "border-neutral-900 bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white"
                  : "border-neutral-200 dark:border-zinc-800 text-neutral-500"
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>{isRTL ? "داكن" : "Dark"}</span>
            </button>

            <button
              onClick={() => setThemeMode("system")}
              className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                themeMode === "system"
                  ? "border-neutral-900 bg-neutral-50 dark:bg-zinc-800 text-neutral-900 dark:text-white"
                  : "border-neutral-200 dark:border-zinc-800 text-neutral-500"
              }`}
            >
              <Laptop className="w-4 h-4 text-sky-500" />
              <span>{isRTL ? "تلقائي" : "System"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreProfile() {
  return (
    <StoreLayout>
      <ProfileContent />
    </StoreLayout>
  );
}
