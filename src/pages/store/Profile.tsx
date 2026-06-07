import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStore } from "@/services/api";
import { useLanguage } from "@/context/language-context";
import { useCurrency, CURRENCIES, CurrencyCode } from "@/context/currency-context";
import { motion } from "framer-motion";
import { useStoreUI } from "@/context/store-ui-context";
import {
  Instagram, MessageCircle, Globe, ChevronRight, ShoppingBag,
  Phone, Mail, MapPin, Star, Package, Heart, Moon, Sun,
} from "lucide-react";

// ── Inner component: runs INSIDE StoreLayout so StoreUIContext is available ──
function ProfileContent({ storeSlug }: { storeSlug: string }) {
  const { data: store } = useGetStore(storeSlug);
  const { language, setLanguage, isRTL } = useLanguage();
  const { activeCurrency, setActiveCurrency, availableCurrencies } = useCurrency();
  const { darkMode, toggleDarkMode } = useStoreUI();

  const primaryColor = store?.primaryColor || "#7C3AED";

  const itemVar = {
    hidden: { opacity: 0, y: 16 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
  };

  return (
    <div className="flex flex-col pb-8" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero Banner ── */}
      <div
        className="relative w-full h-48 flex items-end justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${primaryColor}80 100%)` }}
      >
        {store?.coverImage && (
          <img
            src={store.coverImage}
            alt="cover"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.45), transparent)` }} />

        {/* Store Avatar */}
        <div className="relative z-10 mb-[-36px] flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl border-4 border-white"
            style={{
              background: store?.logoImage
                ? "transparent"
                : `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`,
            }}
          >
            {store?.logoImage ? (
              <img src={store.logoImage} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              store?.name?.charAt(0).toUpperCase()
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
          className="text-2xl font-black text-gray-900 tracking-tight"
        >
          {store?.name || "المتجر"}
        </motion.h1>
        {store?.description && (
          <motion.p custom={1} variants={itemVar} className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs mx-auto">
            {store.description}
          </motion.p>
        )}

        {/* Stats row */}
        <motion.div custom={2} variants={itemVar} className="flex justify-center gap-8 mt-5">
          {[
            { icon: Package, label: "منتج", value: "50+" },
            { icon: Star, label: "تقييم", value: "4.9" },
            { icon: Heart, label: "متابع", value: "2k+" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-xl font-black" style={{ color: primaryColor }}>{value}</span>
              <span className="text-xs text-gray-400 font-semibold">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Divider */}
      <div className="mx-5 mt-7 border-t border-gray-100" />

      {/* ── Quick Actions ── */}
      <div className="px-5 mt-6">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">تواصل معنا</p>

        <div className="flex flex-col gap-2.5">
          {/* WhatsApp */}
          {store?.whatsapp && (
            <motion.a
              custom={3} initial="hidden" animate="show" variants={itemVar}
              href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white transition-all hover:shadow-md active:scale-[0.98]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#25D36615" }}>
                <MessageCircle className="w-5 h-5" style={{ color: "#25D366" }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">واتساب</p>
                <p className="text-xs text-gray-400 mt-0.5">{store.whatsapp}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
            </motion.a>
          )}

          {/* Instagram */}
          {store?.instagram && (
            <motion.a
              custom={4} initial="hidden" animate="show" variants={itemVar}
              href={store.instagram} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white transition-all hover:shadow-md active:scale-[0.98]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#E1306C15" }}>
                <Instagram className="w-5 h-5" style={{ color: "#E1306C" }} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">إنستقرام</p>
                <p className="text-xs text-gray-400 mt-0.5">@{store.instagram.split("/").filter(Boolean).pop()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
            </motion.a>
          )}

          {/* TikTok */}
          {store?.tiktok && (
            <motion.a
              custom={5} initial="hidden" animate="show" variants={itemVar}
              href={store.tiktok} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white transition-all hover:shadow-md active:scale-[0.98]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gray-950/5">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-gray-900"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">تيك توك</p>
                <p className="text-xs text-gray-400 mt-0.5">@{store.tiktok.split("/").filter(Boolean).pop()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" style={{ transform: isRTL ? "rotate(180deg)" : "none" }} />
            </motion.a>
          )}

          {/* If no social links */}
          {!store?.whatsapp && !store?.instagram && !store?.tiktok && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Globe className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">لا توجد روابط تواصل</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Settings ── */}
      <div className="px-5 mt-7">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">الإعدادات</p>

        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          {/* Language */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}12` }}>
                <Globe className="w-4 h-4" style={{ color: primaryColor }} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">اللغة</p>
                <p className="text-xs text-gray-400">{language === "ar" ? "العربية" : "English"}</p>
              </div>
            </div>
            <button
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="px-4 py-1.5 rounded-full text-xs font-black transition-all"
              style={{ background: `${primaryColor}15`, color: primaryColor }}
            >
              {language === "en" ? "عربي" : "EN"}
            </button>
          </div>

          {/* Currency */}
          {availableCurrencies.length > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${primaryColor}12` }}>
                  <span className="text-base font-black" style={{ color: primaryColor }}>{activeCurrency.symbol}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">العملة</p>
                  <p className="text-xs text-gray-400">{activeCurrency.name}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {availableCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setActiveCurrency(c.code as CurrencyCode)}
                    className="px-3 py-1.5 rounded-full text-xs font-black transition-all"
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

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ background: darkMode ? `${primaryColor}18` : "#f3f4f6" }}
              >
                {darkMode
                  ? <Moon className="w-4 h-4" style={{ color: primaryColor }} />
                  : <Sun className="w-4 h-4 text-gray-400" />}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">الثيم</p>
                <p className="text-xs text-gray-400">{darkMode ? "الوضع الليلي 🌙" : "الوضع النهاري ☀️"}</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={toggleDarkMode}
              className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none"
              style={{ background: darkMode ? primaryColor : "#e5e7eb" }}
            >
              <div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
                style={{ [isRTL ? (darkMode ? "left" : "right") : (darkMode ? "right" : "left")]: "4px" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="px-5 mt-6">
        <Link href={`/store/${storeSlug}/products`}>
          <button
            className="w-full h-14 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)`,
              boxShadow: `0 6px 24px ${primaryColor}40`,
            }}
          >
            <ShoppingBag className="w-5 h-5" />
            تسوقي الآن
          </button>
        </Link>
      </div>

    </div>
  );
}

// ── Outer component: wraps content in StoreLayout (which provides the context) ──
export default function StoreProfile() {
  const [, params] = useRoute("/store/:storeSlug/profile");
  const storeSlug = params?.storeSlug || "demo-store";

  return (
    <StoreLayout storeSlug={storeSlug}>
      <ProfileContent storeSlug={storeSlug} />
    </StoreLayout>
  );
}
