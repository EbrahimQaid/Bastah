import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import {
  useGetDashboardStore,
  useUpdateDashboardStore,
  getGetDashboardStoreQueryKey
} from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Copy, Palette, Type, Globe, DollarSign,
  Layout, Megaphone, Image, ExternalLink,
  LayoutGrid, MonitorSmartphone, Camera, Star, Tag, Truck, Settings2, ChevronDown, 
  Instagram, MessageCircle, Twitter, Facebook, Smartphone, LayoutPanelLeft, Layers, Footprints, BellRing
} from "lucide-react";
import { DEFAULT_THEME, parseThemeConfig, type ThemeConfig } from "@/context/theme-context";
import { motion, AnimatePresence } from "framer-motion";

const FONT_OPTIONS = [
  { value: "Poppins", label: "Poppins", preview: "Modern & Clean" },
  { value: "Inter", label: "Inter", preview: "Neutral & Professional" },
  { value: "Tajawal", label: "Tajawal", preview: "Arabic-Friendly" },
  { value: "Cairo", label: "Cairo", preview: "Arabic & English" },
  { value: "Playfair Display", label: "Playfair Display", preview: "Elegant & Luxury" },
];

const ALL_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
];

const COLOR_PRESETS = ["#C1121F","#7c3aed","#0891b2","#059669","#d97706","#db2777","#1d4ed8","#0f172a","#f97316","#84cc16"];

const THEME_PRESETS = [
  {
    name: "بنفسجي عصري",
    primary: "#7C3AED",
    theme: { ...DEFAULT_THEME, navbarStyle: "white", cardStyle: "shadow", buttonRadius: "full" }
  },
  {
    name: "أحمر كلاسيكي",
    primary: "#C1121F",
    theme: { ...DEFAULT_THEME, navbarStyle: "colored", cardStyle: "bordered", buttonRadius: "md" }
  },
  {
    name: "ليلي هادئ",
    primary: "#0f172a",
    theme: { ...DEFAULT_THEME, navbarStyle: "white", cardStyle: "minimal", buttonRadius: "sm" }
  },
  {
    name: "ذهبي فاخر",
    primary: "#854d0e",
    theme: { ...DEFAULT_THEME, navbarStyle: "transparent", cardStyle: "shadow", buttonRadius: "lg" }
  }
];

function SectionCard({ icon: Icon, title, description, children, id }: { icon: React.ElementType; title: string; description?: string; children: React.ReactNode; id?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      id={id} 
      className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-8 border-b border-gray-50 bg-gray-50/30">
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-black text-lg text-gray-900">{title}</h2>
          {description && <p className="text-xs font-bold text-gray-400 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-8 space-y-6">{children}</div>
    </motion.div>
  );
}

function ColorField({ label, value, onChange, presets }: { label: string; value: string; onChange: (v: string) => void; presets?: string[] }) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-black text-gray-700">{label}</Label>
      <div className="flex gap-3 items-center">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
           <input type="color" className="absolute inset-0 w-full h-full p-0 border-none cursor-pointer scale-[2]" value={value} onChange={e => onChange(e.target.value)} />
        </div>
        <Input value={value} onChange={e => onChange(e.target.value)} className="font-mono text-sm bg-gray-50 border-none rounded-xl" placeholder="#C1121F" />
      </div>
      {presets && (
        <div className="flex gap-2 flex-wrap mt-2">
          {presets.map(c => (
            <button key={c} type="button" onClick={() => onChange(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${value === c ? "border-primary scale-110 shadow-lg" : "border-white shadow-sm hover:scale-105"}`}
              style={{ background: c }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { data: store, isLoading } = useGetDashboardStore();
  const updateStore = useUpdateDashboardStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState("identity");

  const [form, setForm] = useState({
    name: "",
    description: "",
    whatsappNumber: "",
    primaryColor: "#C1121F",
    secondaryColor: "#F3F4F6",
    fontFamily: "Poppins",
    coverImage: "",
    logoImage: "",
    currencies: ["USD", "SAR", "YER"] as string[],
    defaultCurrency: "USD",
    shippingRate: "0",
  });

  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const setT = (patch: Partial<ThemeConfig>) => setTheme(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    if (store) {
      let currencies = ["USD", "SAR", "YER"];
      try { if (store.currencies) currencies = JSON.parse(store.currencies); } catch {}
      setForm({
        name: store.name,
        description: store.description || "",
        whatsappNumber: store.whatsappNumber,
        primaryColor: store.primaryColor || "#C1121F",
        secondaryColor: store.secondaryColor || "#F3F4F6",
        fontFamily: store.fontFamily || "Poppins",
        coverImage: store.coverImage || "",
        logoImage: store.logoImage || "",
        currencies,
        defaultCurrency: store.defaultCurrency || "USD",
        shippingRate: String(store.shippingRate || "0"),
      });
      setTheme(parseThemeConfig(store.themeConfig));
    }
  }, [store]);

  const applyPreset = (p: typeof THEME_PRESETS[0]) => {
    setForm(f => ({ ...f, primaryColor: p.primary }));
    setT(p.theme);
    toast({ title: `تم تطبيق نمط: ${p.name}` });
  };

  const toggleCurrency = (code: string) => {
    setForm(f => {
      const has = f.currencies.includes(code);
      const next = has ? f.currencies.filter(c => c !== code) : [...f.currencies, code];
      if (next.length === 0) return f;
      const defaultCurrency = next.includes(f.defaultCurrency) ? f.defaultCurrency : next[0];
      return { ...f, currencies: next, defaultCurrency };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore.mutate({
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
      }
    }, {
      onSuccess: () => {
        toast({ title: "✓ تم حفظ الإعدادات بنجاح", description: "تم تحديث متجرك الآن." });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
      }
    });
  };

  if (isLoading) return <DashboardLayout><div className="py-16 text-center text-gray-400 font-bold">جاري تحميل الإعدادات...</div></DashboardLayout>;

  const categories = [
    { id: "identity", label: "هوية المتجر", icon: Globe },
    { id: "design",   label: "التصميم والألوان", icon: Palette },
    { id: "hero",     label: "الواجهة الرئيسية", icon: LayoutPanelLeft },
    { id: "sections", label: "الأقسام والترتيب", icon: Layers },
    { id: "logistics",label: "الشحن والعملات", icon: Truck },
    { id: "social",   label: "روابط التواصل", icon: Smartphone },
    { id: "footer",   label: "تذييل الصفحة", icon: Footprints },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-5xl mx-auto pb-20" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">تخصيص المتجر</h1>
            <p className="text-gray-400 font-medium mt-1">تحكم كامل في مظهر وهوية متجرك كما يحب عملاؤك.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button 
                onClick={handleSubmit} 
                disabled={updateStore.isPending}
                className="h-14 px-8 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
             >
                {updateStore.isPending ? "جاري الحفظ..." : "حفظ كافة التغييرات"}
             </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black whitespace-nowrap transition-all ${
                activeCategory === cat.id 
                ? "bg-gray-900 text-white shadow-xl shadow-gray-200" 
                : "bg-white text-gray-400 hover:text-gray-600 border border-gray-50"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <AnimatePresence mode="wait">
            {/* 1. Identity Section */}
            {activeCategory === "identity" && (
              <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionCard icon={Globe} title="هوية المتجر الأساسية" description="تغيير الاسم، الوصف، والشعار الخاص بمتجرك.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">اسم المتجر</Label>
                      <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">رقم الواتساب</Label>
                      <Input required value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="+966" className="h-12 bg-gray-50 border-none rounded-xl font-bold text-left" dir="ltr" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-black text-gray-700">وصف المتجر (يظهر في محركات البحث)</Label>
                    <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-gray-50 border-none rounded-2xl font-bold" rows={3} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <ImageUpload label="صورة الغلاف (Banner)" hint="تظهر كخلفية في الصفحة الرئيسية" value={form.coverImage} onChange={v => setForm({ ...form, coverImage: v })} aspectRatio="wide" />
                    <ImageUpload label="شعار المتجر (Logo)" hint="يفضل أن يكون مربعاً وبخلفية شفافة" value={form.logoImage} onChange={v => setForm({ ...form, logoImage: v })} aspectRatio="square" />
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* 2. Design Section */}
            {activeCategory === "design" && (
              <motion.div key="design" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-8">
                  <SectionCard icon={Settings2} title="نماذج جاهزة" description="اختر تنسيقاً جاهزاً بضغطة زر واحدة.">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {THEME_PRESETS.map(p => (
                        <button key={p.name} type="button" onClick={() => applyPreset(p)}
                          className="group flex flex-col gap-3 p-4 rounded-3xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all text-right">
                          <div className="w-full h-12 rounded-2xl shadow-sm transition-transform group-hover:scale-105" style={{ background: p.primary }} />
                          <span className="text-xs font-black text-gray-700">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard icon={Palette} title="الألوان والخطوط" description="خصص الألوان الأساسية ونوع الخط ليتناسب مع براند متجرك.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ColorField label="اللون الأساسي (Primary)" value={form.primaryColor} onChange={v => setForm({ ...form, primaryColor: v })} presets={COLOR_PRESETS} />
                      <div className="space-y-3">
                        <Label className="text-sm font-black text-gray-700">نوع الخط (Font Family)</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {FONT_OPTIONS.map(f => (
                            <button 
                              key={f.value} 
                              type="button" 
                              onClick={() => setForm({...form, fontFamily: f.value})}
                              className={`flex items-center justify-between px-5 py-3 rounded-2xl border transition-all ${form.fontFamily === f.value ? "border-primary bg-primary/5 text-primary" : "border-gray-50 bg-gray-50 text-gray-400"}`}
                              style={{ fontFamily: f.value }}
                            >
                              <span className="font-bold">{f.label}</span>
                              <span className="text-[10px] opacity-60">{f.preview}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard icon={MonitorSmartphone} title="شريط التنقل (Navbar)" description="تحكم في شكل ترويسة المتجر.">
                    <div className="grid grid-cols-3 gap-4">
                      {(["white", "colored", "transparent"] as const).map(s => (
                        <button key={s} type="button" onClick={() => setT({ navbarStyle: s })}
                          className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${theme.navbarStyle === s ? "border-primary bg-primary/5" : "border-gray-50 hover:border-gray-100"}`}>
                          <div className={`w-full h-8 rounded-xl shadow-inner ${s === "white" ? "bg-white border border-gray-100" : s === "colored" ? "bg-primary" : "bg-gray-900/50"}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{s === "white" ? "أبيض" : s === "colored" ? "ملون" : "شفاف"}</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </motion.div>
            )}

            {/* 3. Hero Section */}
            {activeCategory === "hero" && (
              <motion.div key="hero" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionCard icon={LayoutPanelLeft} title="الواجهة الترحيبية" description="تعديل النصوص والأزرار في أعلى الصفحة الرئيسية.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">العنوان الرئيسي (Hero Title)</Label>
                      <Input value={theme.heroTitle} onChange={e => setT({ heroTitle: e.target.value })} placeholder="أهلاً بكم في متجرنا" className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">العنوان الفرعي (Subtitle)</Label>
                      <Input value={theme.heroSubtitle} onChange={e => setT({ heroSubtitle: e.target.value })} placeholder="اكتشف أحدث التشكيلات" className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">نص زر التفاعل (CTA Text)</Label>
                      <Input value={theme.heroCtaText} onChange={e => setT({ heroCtaText: e.target.value })} className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">حجم واجهة العرض</Label>
                      <div className="flex gap-2">
                        {(["small", "medium", "large", "fullscreen"] as const).map(h => (
                          <button key={h} type="button" onClick={() => setT({ heroHeight: h })}
                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black transition-all ${theme.heroHeight === h ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-gray-50 text-gray-400 border-transparent"}`}
                          >
                            {h.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                       <Label className="text-sm font-black text-gray-700">شفافية الطبقة السوداء (Overlay)</Label>
                       <span className="text-xs font-black text-primary">{theme.heroOverlayOpacity}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="90" step="5" 
                      value={theme.heroOverlayOpacity} 
                      onChange={e => setT({ heroOverlayOpacity: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* 4. Sections Order */}
            {activeCategory === "sections" && (
              <motion.div key="sections" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-8">
                  <SectionCard icon={Layers} title="ترتيب أقسام المتجر" description="اسحب وأفلت لترتيب ظهور الأقسام في الصفحة الرئيسية.">
                    <div className="space-y-3">
                      {theme.sectionOrder.map((key, idx) => (
                        <div key={key} className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-primary/20 transition-all group">
                           <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-primary/5 group-hover:text-primary">
                             {idx + 1}
                           </div>
                           <span className="text-sm font-black text-gray-900 flex-1">
                            {key === "categories" ? "الأقسام (Categories)" : key === "featured" ? "المنتجات المميزة" : "كل المنتجات"}
                          </span>
                          <div className="flex gap-2">
                            <button type="button" disabled={idx === 0} onClick={() => {
                              const next = [...theme.sectionOrder];
                              [next[idx], next[idx-1]] = [next[idx-1], next[idx]];
                              setT({ sectionOrder: next });
                            }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-white hover:shadow-md disabled:opacity-20 transition-all">
                              <ChevronDown className="w-5 h-5 rotate-180" />
                            </button>
                            <button type="button" disabled={idx === theme.sectionOrder.length - 1} onClick={() => {
                              const next = [...theme.sectionOrder];
                              [next[idx], next[idx+1]] = [next[idx+1], next[idx]];
                              setT({ sectionOrder: next });
                            }} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-white hover:shadow-md disabled:opacity-20 transition-all">
                              <ChevronDown className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard icon={LayoutGrid} title="تنسيق عرض المنتجات" description="تحكم في كيفية ظهور شبكة المنتجات.">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-sm font-black text-gray-700">عدد الأعمدة (لأجهزة الكمبيوتر)</Label>
                          <div className="flex gap-2">
                            {[2, 3].map(n => (
                              <button key={n} type="button" onClick={() => setT({ gridCols: n as any })}
                                className={`flex-1 py-4 rounded-2xl border-2 font-black text-xs transition-all ${theme.gridCols === n ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-gray-50 bg-gray-50 text-gray-400"}`}>{n} أعمدة</button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-sm font-black text-gray-700">شكل الأزرار</Label>
                          <div className="flex gap-2 flex-wrap">
                            {["sm", "md", "lg", "full"].map(r => (
                              <button key={r} type="button" onClick={() => setT({ buttonRadius: r as any })}
                                className={`flex-1 py-4 rounded-2xl border-2 text-[10px] font-black transition-all ${theme.buttonRadius === r ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-gray-50 bg-gray-50 text-gray-400"}`}>{r.toUpperCase()}</button>
                            ))}
                          </div>
                        </div>
                     </div>
                  </SectionCard>
                </div>
              </motion.div>
            )}

            {/* 5. Logistics Section */}
            {activeCategory === "logistics" && (
              <motion.div key="logistics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-8">
                  <SectionCard icon={DollarSign} title="العملات المتاحة" description="اختر العملات التي تريد تفعيلها في متجرك.">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ALL_CURRENCIES.map(c => (
                        <button key={c.code} type="button" onClick={() => toggleCurrency(c.code)}
                          className={`group flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${form.currencies.includes(c.code) ? "border-primary bg-primary/5 text-primary" : "border-gray-50 bg-gray-50 text-gray-400"}`}>
                          <div className="flex flex-col items-start">
                             <span className="text-sm font-black uppercase">{c.code}</span>
                             <span className="text-[10px] font-bold opacity-60">{c.name}</span>
                          </div>
                          <span className="text-lg font-black">{c.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard icon={Truck} title="إعدادات الشحن" description="تحديد تكلفة الشحن الثابتة للطلبات.">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-black text-gray-700">سعر الشحن الثابت ({form.defaultCurrency})</Label>
                        <Input type="number" value={form.shippingRate} onChange={e => setForm({ ...form, shippingRate: e.target.value })} className="h-12 bg-gray-50 border-none rounded-xl font-black" />
                        <p className="text-[11px] text-gray-400 font-bold">سيتم إضافة هذا المبلغ تلقائياً إلى إجمالي الطلب عند الدفع.</p>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              </motion.div>
            )}

            {/* 6. Social Media */}
            {activeCategory === "social" && (
              <motion.div key="social" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <SectionCard icon={Smartphone} title="روابط التواصل الاجتماعي" description="ستظهر هذه الروابط في تذييل المتجر لسهولة وصول العملاء إليك.">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-[#E1306C]/10 flex items-center justify-center border border-[#E1306C]/10">
                          <Instagram className="w-6 h-6 text-[#E1306C]" />
                       </div>
                       <div className="flex-1 space-y-1.5">
                          <Label className="text-sm font-black text-gray-700">رابط انستقرام (Instagram)</Label>
                          <Input value={theme.instagram} onChange={e => setT({ instagram: e.target.value })} placeholder="https://instagram.com/your-store" className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-black/10 flex items-center justify-center border border-black/10">
                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>
                       </div>
                       <div className="flex-1 space-y-1.5">
                          <Label className="text-sm font-black text-gray-700">رابط تيك توك (TikTok)</Label>
                          <Input value={theme.tiktok} onChange={e => setT({ tiktok: e.target.value })} placeholder="https://tiktok.com/@your-store" className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                       </div>
                    </div>
                  </div>
                </SectionCard>
              </motion.div>
            )}

            {/* 7. Footer & Extras */}
            {activeCategory === "footer" && (
              <motion.div key="footer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                 <div className="space-y-8">
                  <SectionCard icon={BellRing} title="شريط الإعلانات (Announcement Bar)" description="يظهر في أعلى الصفحة لشد انتباه العملاء للعروض.">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-black text-gray-700">نص الإعلان</Label>
                        <Input value={theme.announcementBar} onChange={e => setT({ announcementBar: e.target.value })} placeholder="تخفيضات تصل إلى 50% بمناسبة الافتتاح!" className="h-12 bg-gray-50 border-none rounded-xl font-bold" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <ColorField label="لون خلفية الشريط" value={theme.announcementBarBg} onChange={v => setT({ announcementBarBg: v })} />
                        <ColorField label="لون نص الإعلان" value={theme.announcementBarText} onChange={v => setT({ announcementBarText: v })} />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard icon={Footprints} title="تذييل الصفحة (Footer)" description="تحكم في النصوص التي تظهر أسفل كل صفحة.">
                    <div className="space-y-2">
                      <Label className="text-sm font-black text-gray-700">نص التذييل (Footer Text)</Label>
                      <Textarea value={theme.footerText} onChange={e => setT({ footerText: e.target.value })} placeholder="جميع الحقوق محفوظة © 2024 بَسطة" className="bg-gray-50 border-none rounded-2xl font-bold" rows={3} />
                    </div>
                  </SectionCard>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sticky Mobile Save Bar */}
          <div className="lg:hidden fixed bottom-20 left-6 right-6 z-50">
             <Button onClick={handleSubmit} className="w-full h-14 rounded-2xl bg-primary text-white font-black shadow-2xl shadow-primary/40">
                حفظ التغييرات
             </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
