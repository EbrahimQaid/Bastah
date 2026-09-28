import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  useGetDashboardStore,
  useUpdateDashboardStore,
  getGetDashboardStoreQueryKey,
} from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Globe,
  Palette,
  Truck,
  Smartphone,
  Save,
  Check,
  CheckCircle2,
} from "lucide-react";
import { DEFAULT_THEME, parseThemeConfig, type ThemeConfig } from "@/context/theme-context";

const FONT_OPTIONS = [
  { value: "Tajawal", label: "Tajawal (تجوال - عصري وواضح)" },
  { value: "Cairo", label: "Cairo (القاهرة - هندسي وأنيق)" },
  { value: "Poppins", label: "Poppins (حديث وبسيط)" },
  { value: "Inter", label: "Inter (احترافي محايد)" },
];

const ALL_CURRENCIES = [
  { code: "SAR", name: "ريال سعودي", symbol: "ر.س" },
  { code: "YER", name: "ريال يمني", symbol: "﷼" },
  { code: "USD", name: "دولار أمريكي", symbol: "$" },
  { code: "AED", name: "درهم إماراتي", symbol: "د.إ" },
  { code: "EUR", name: "يورو", symbol: "€" },
  { code: "GBP", name: "جنيه إسترليني", symbol: "£" },
];

const COLOR_PRESETS = [
  "#991B1B", // Crimson
  "#DC2626", // Red
  "#0F172A", // Slate dark
  "#059669", // Emerald
  "#D97706", // Amber
  "#0891B2", // Cyan
  "#1D4ED8", // Blue
  "#7C3AED", // Violet
];

export default function Settings() {
  const { data: store, isLoading } = useGetDashboardStore();
  const updateStore = useUpdateDashboardStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"identity" | "logistics" | "design" | "social">("identity");

  const [form, setForm] = useState({
    name: "",
    description: "",
    whatsappNumber: "",
    primaryColor: "#991B1B",
    secondaryColor: "#F3F4F6",
    fontFamily: "Tajawal",
    coverImage: "",
    logoImage: "",
    currencies: ["SAR", "YER", "USD"] as string[],
    defaultCurrency: "SAR",
    shippingRate: "0",
  });

  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const setT = (patch: Partial<ThemeConfig>) => setTheme((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (store) {
      let currencies = ["SAR", "YER", "USD"];
      try {
        if (store.currencies) currencies = JSON.parse(store.currencies);
      } catch {}
      setForm({
        name: store.name,
        description: store.description || "",
        whatsappNumber: store.whatsappNumber,
        primaryColor: store.primaryColor || "#991B1B",
        secondaryColor: store.secondaryColor || "#F3F4F6",
        fontFamily: store.fontFamily || "Tajawal",
        coverImage: store.coverImage || "",
        logoImage: store.logoImage || "",
        currencies,
        defaultCurrency: store.defaultCurrency || "SAR",
        shippingRate: String(store.shippingRate || "0"),
      });
      setTheme(parseThemeConfig(store.themeConfig));
    }
  }, [store]);

  const toggleCurrency = (code: string) => {
    setForm((f) => {
      const has = f.currencies.includes(code);
      const next = has ? f.currencies.filter((c) => c !== code) : [...f.currencies, code];
      if (next.length === 0) return f;
      const defaultCurrency = next.includes(f.defaultCurrency) ? f.defaultCurrency : next[0];
      return { ...f, currencies: next, defaultCurrency };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore.mutate(
      {
        data: {
          name: form.name,
          description: form.description || null,
          whatsappNumber: form.whatsappNumber,
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor || null,
          fontFamily: form.fontFamily || null,
          coverImage: form.coverImage || null,
          logoImage: form.logoImage || null,
          currencies: JSON.stringify(form.currencies),
          defaultCurrency: form.defaultCurrency,
          shippingRate: Number(form.shippingRate),
          themeConfig: JSON.stringify(theme),
        },
      },
      {
        onSuccess: () => {
          toast({ title: "تم حفظ إعدادات المتجر بنجاح" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-xs text-neutral-400 font-bold" dir="rtl">
          جاري تحميل إعدادات المتجر...
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: "identity",  label: "هوية المتجر",     icon: Globe },
    { id: "logistics", label: "العملات والشحن",   icon: Truck },
    { id: "design",    label: "الألوان والمظهر",  icon: Palette },
    { id: "social",    label: "قنوات التواصل",    icon: Smartphone },
  ] as const;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              إعدادات المتجر
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
              تخصيص الهوية التجارية، العملات المفعلة، الشعار وشريط الإعلانات.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={updateStore.isPending}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-xs self-start sm:self-auto"
          >
            {updateStore.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>حفظ الإعدادات</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200/80 dark:border-zinc-800 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Identity Tab */}
          {activeTab === "identity" && (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                معلومات المتجر الأساسية
              </h2>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">اسم المتجر</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                  placeholder="اسم متجرك التجاري"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">وصف المتجر والنشاط</Label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 text-xs bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-red-600"
                  placeholder="نبذة مختصرة تظهر في رأس المتجر والفوتر للعملاء..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">رقم الواتساب الرسمي</Label>
                <Input
                  required
                  dir="ltr"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  className="h-10 text-xs font-mono bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                  placeholder="+967771234567"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">شعار المتجر (Logo)</Label>
                  <ImageUpload
                    value={form.logoImage}
                    onChange={(url) => setForm({ ...form, logoImage: url })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">صورة غلاف الواجهة (Cover Banner)</Label>
                  <ImageUpload
                    value={form.coverImage}
                    onChange={(url) => setForm({ ...form, coverImage: url })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. Logistics & Currencies Tab */}
          {activeTab === "logistics" && (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-1">
                  العملات المدعومة في المتجر
                </h2>
                <p className="text-[11px] text-neutral-400">
                  حدد العملات التي يمكن لعملائك التبديل بينها أثناء تصفح وشراء المنتجات.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ALL_CURRENCIES.map((c) => {
                  const isSupported = form.currencies.includes(c.code);
                  const isDefault = form.defaultCurrency === c.code;

                  return (
                    <div
                      key={c.code}
                      onClick={() => toggleCurrency(c.code)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSupported
                          ? "bg-neutral-50 dark:bg-zinc-800/80 border-neutral-300 dark:border-zinc-700"
                          : "border-neutral-200 dark:border-zinc-800 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                          <span>{c.code}</span>
                          <span className="font-mono text-neutral-400 font-normal">({c.symbol})</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{c.name}</p>
                      </div>
                      {isSupported && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">العملة الافتراضية</Label>
                  <select
                    value={form.defaultCurrency}
                    onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-zinc-700 rounded-xl font-bold text-neutral-900 dark:text-white"
                  >
                    {form.currencies.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                    رسوم الشحن والتوصيل الافتراضية ({form.defaultCurrency})
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.shippingRate}
                    onChange={(e) => setForm({ ...form, shippingRate: e.target.value })}
                    className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                  />
                  <p className="text-[10px] text-neutral-400">اتركها 0 إذا كان الشحن مجانياً.</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Design & Appearance Tab */}
          {activeTab === "design" && (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-1">
                  المظهر والألوان
                </h2>
                <p className="text-[11px] text-neutral-400">
                  تحديد اللون المميز للهوية التجارية وشريط الإعلانات الترويجي أعلى الصفحة.
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">اللون الأساسي للهوية</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    className="w-10 h-10 p-0 border border-neutral-200 dark:border-zinc-700 rounded-lg cursor-pointer shrink-0"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="w-32 font-mono text-xs h-10 bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm({ ...form, primaryColor: color })}
                        className={`w-6 h-6 rounded-full border transition-transform ${
                          form.primaryColor === color ? "scale-125 border-neutral-900 dark:border-white shadow-xs" : "border-transparent hover:scale-110"
                        }`}
                        style={{ background: color }}
                        aria-label={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">نوع الخط الأساسي</Label>
                <select
                  value={form.fontFamily}
                  onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-zinc-700 rounded-xl font-bold text-neutral-900 dark:text-white cursor-pointer"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Promotional Announcement Bar */}
              <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                      شريط الإعلانات أعلى الصفحة
                    </Label>
                    <p className="text-[11px] text-neutral-400">
                      رسالة ترويجية تظهر في أعلى واجهة المتجر (خصومات، شحن مجاني، تنبيهات).
                    </p>
                  </div>
                </div>

                <Input
                  value={theme.announcementBar || ""}
                  onChange={(e) => setT({ announcementBar: e.target.value })}
                  className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                  placeholder="مثال: شحن مجاني لكافة الطلبات فوق 200 ر.س | كود خصم: WELCOME"
                />
              </div>
            </div>
          )}

          {/* 4. Social Links Tab */}
          {activeTab === "social" && (
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                روابط التواصل الاجتماعي
              </h2>
              <p className="text-[11px] text-neutral-400">
                تظهر هذه الروابط في تذييل متجر العملاء لتعزيز موثوقية علامتك التجارية وسهولة الوصول إليك.
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">حساب إنستغرام (Instagram)</Label>
                  <Input
                    dir="ltr"
                    value={theme.instagram || ""}
                    onChange={(e) => setT({ instagram: e.target.value })}
                    className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                    placeholder="https://instagram.com/yourstore"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">حساب تيك توك (TikTok)</Label>
                  <Input
                    dir="ltr"
                    value={theme.tiktok || ""}
                    onChange={(e) => setT({ tiktok: e.target.value })}
                    className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                    placeholder="https://tiktok.com/@yourstore"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">نص مخصص لتذييل الصفحة (Footer Note)</Label>
                  <Input
                    value={theme.footerText || ""}
                    onChange={(e) => setT({ footerText: e.target.value })}
                    className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
                    placeholder="ملاحظة إضافية عن ساعات العمل أو موقع الفرع الرئيسي..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={updateStore.isPending}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-xs"
            >
              {updateStore.isPending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
