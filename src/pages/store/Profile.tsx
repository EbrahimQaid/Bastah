import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStore } from "@/services/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import { motion } from "framer-motion";
import { useStoreUI, ThemeMode } from "@/context/store-ui-context";
import DukkaniLogo from "@/components/ui/DukkaniLogo";
import {
  Instagram, MessageCircle, Globe, ChevronRight, ShoppingBag,
  Phone, Mail, MapPin, Star, Package, Heart, Moon, Sun, Check, Laptop,
} from "lucide-react";

// ── Inner component: runs INSIDE StoreLayout so StoreUIContext is available ──
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

  const isOldBastahLogo =
    !store?.logoImage ||
    (typeof store.logoImage === "string" && store.logoImage.toLowerCase().includes("bastah")) ||
    store?.name?.includes("بسطة") ||
    store?.name?.includes("بَسطة");

  const storeDisplayName =
    store?.name &&
    !store.name.includes("بسطة") &&
    !store.name.includes("بَسطة") &&
    !store.name.toLowerCase().includes("bastah")
      ? store.name
      : "دكاني - Dukkani";

  const itemVar = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
  };

  return (
    <div className="flex flex-col pb-8" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero Banner ── */}
      <div
        className="relative w-full h-44 flex items-end justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor}ee 0%, ${primaryColor}88 100%)` }}
      >
        {store?.coverImage && (
          <img
            src={store.coverImage}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.5), transparent)` }} />

        {/* Store Avatar */}
        <div className="relative z-10 mb-[-34px] flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-xl border-4 border-white dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-900"
          >
            {!isOldBastahLogo && store?.logoImage ? (
              <img src={store.logoImage} alt={storeDisplayName} className="w-full h-full object-cover" />
            ) : (
              <DukkaniLogo size="md" iconOnly />
            )}
          </div>
        </div>
      </div>

      {/* ── Store Info ── */}
      <motion.div
        className="pt-12 px-5 text-center"
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      >
        <motion.h1
          custom={0} variants={itemVar}
          className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight"
        >
          {storeDisplayName}
        </motion.h1>
        {store?.description && (
          <motion.p custom={1} variants={itemVar} className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
            {store.description}
          </motion.p>
        )}

        {/* Stats row */}
        <motion.div custom={2} variants={itemVar} className="flex justify-center gap-6 mt-4">
          {[
            { icon: Package, label: "منتجات حصرية", value: "50+" },
            { icon: Heart, label: "عميل سعيد", value: "2k+" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
              <span className="text-base font-black" style={{ color: primaryColor }}>{value}</span>
              <span className="text-[10px] text-gray-400 font-semibold">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <div className="px-5 mt-6">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">تواصل مع خدمة العملاء</p>

        <div className="flex flex-col gap-2.5">
          {/* WhatsApp */}
          {store?.whatsappNumber && (
            <motion.a
              custom={3} initial="hidden" animate="show" variants={itemVar}
              href={`https://wa.me/${store.whatsappNumber.replace(/\D/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 transition-all hover:shadow-md active:scale-[0.98]"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#25D36618" }}>
                <MessageCircle className="w-5 h-5" style={{ color: "#25D366" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">محادثة فورية عبر واتساب</p>
                <p className="text-[11px] text-gray-400 mt-0.5" dir="ltr">{store.whatsappNumber}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
            </motion.a>
          )}

          {!store?.whatsappNumber && (
            <div className="flex flex-col items-center justify-center py-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
              <Globe className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs text-gray-400">يسعدنا خدمتك دائماً</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="px-5 mt-6">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2.5">تخصيص العرض والتفضيلات</p>

        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
          {/* Language */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}12` }}>
                <Globe className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">اللغة / Language</p>
                <p className="text-[11px] text-gray-400">{language === "ar" ? "العربية" : "English"}</p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="px-3.5 py-1.5 rounded-full text-xs font-black transition-all active:scale-95"
              style={{ background: `${primaryColor}15`, color: primaryColor }}
            >
              {language === "en" ? "العربية" : "EN"}
            </button>
          </div>

          {/* Currency */}
          {availableCurrencies.length > 1 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}12` }}>
                  <span className="text-sm font-black" style={{ color: primaryColor }}>{activeCurrency.symbol}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm">العملة</p>
                  <p className="text-[11px] text-gray-400">{activeCurrency.name}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {availableCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setActiveCurrency(c.code as CurrencyCode)}
                    className="px-2.5 py-1 rounded-lg text-xs font-black transition-all active:scale-95"
                    style={
                      activeCurrency.code === c.code
                        ? { background: primaryColor, color: "#fff" }
                        : { background: "#f3f4f6", color: "#6b7280" }
                    }
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Theme Mode Selection */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: `${primaryColor}14` }}
                >
                  {isDark ? (
                    <Moon className="w-4 h-4" style={{ color: primaryColor }} />
                  ) : (
                    <Sun className="w-4 h-4" style={{ color: primaryColor }} />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-zinc-100 text-xs sm:text-sm">
                    {isRTL ? "مظهر المتجر" : "Theme Mode"}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-400">
                    {themeMode === "light"
                      ? (isRTL ? "الوضع الفاتح (نهاري) ☀️" : "Light mode active")
                      : themeMode === "dark"
                      ? (isRTL ? "الوضع الداكن (ليلي مريح) 🌙" : "Dark mode active")
                      : (isRTL ? "تلقائي (حسب إعدادات جهازك) 💻" : "Auto (matches device settings)")}
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Theme Options */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                {
                  id: "light",
                  label: isRTL ? "فاتح" : "Light",
                  sub: isRTL ? "نهاري" : "Day",
                  icon: Sun,
                  iconColor: "text-amber-500",
                },
                {
                  id: "dark",
                  label: isRTL ? "داكن" : "Dark",
                  sub: isRTL ? "ليلي" : "Night",
                  icon: Moon,
                  iconColor: "text-indigo-400",
                },
                {
                  id: "system",
                  label: isRTL ? "تلقائي" : "System",
                  sub: isRTL ? "النظام" : "Auto",
                  icon: Laptop,
                  iconColor: "text-sky-500",
                },
              ].map((tOption) => {
                const isSelected = themeMode === tOption.id;
                const Icon = tOption.icon;
                return (
                  <button
                    key={tOption.id}
                    type="button"
                    onClick={() => setThemeMode(tOption.id as ThemeMode)}
                    className={`relative p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all duration-200 border ${
                      isSelected
                        ? "bg-red-50/70 dark:bg-red-950/30 border-red-500/60 dark:border-red-500/50 shadow-xs"
                        : "bg-gray-50/80 dark:bg-zinc-800/50 hover:bg-gray-100/80 dark:hover:bg-zinc-800 border-gray-100 dark:border-zinc-800"
                    }`}
                    style={isSelected ? { borderColor: `${primaryColor}60` } : undefined}
                  >
                    {isSelected && (
                      <span
                        className="absolute top-1.5 end-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-xs"
                        style={{ background: primaryColor }}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <Icon className={`w-5 h-5 ${tOption.iconColor}`} />
                    <span className={`text-xs font-black ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-zinc-300"}`}>
                      {tOption.label}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                      {tOption.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-5 mt-6">
        <Link href="/store/products">
          <button
            className="w-full h-13 rounded-2xl text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
              boxShadow: `0 6px 20px ${primaryColor}40`,
            }}
          >
            <ShoppingBag className="w-4 h-4" />
            استكشف جميع المنتجات
          </button>
        </Link>
      </div>

    </div>
  );
}

// ── Outer component: wraps content in StoreLayout (which provides the context) ──
export default function StoreProfile() {
  return (
    <StoreLayout>
      <ProfileContent />
    </StoreLayout>
  );
}
