import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Store, Palette, Package, ArrowRight, ArrowLeft } from "lucide-react";
import DukkaniLogo from "@/components/ui/DukkaniLogo";

const STEPS = [
  { id: 1, title: "معلومات المتجر", icon: Store },
  { id: 2, title: "المظهر والهوية", icon: Palette },
  { id: 3, title: "الإعدادات", icon: Package },
];

const THEMES = [
  { name: "أحمر دكاني", primary: "#991B1B", secondary: "#DC2626" },
  { name: "أزرق كحلي", primary: "#1D4ED8", secondary: "#60A5FA" },
  { name: "أخضر زمردي", primary: "#059669", secondary: "#34D399" },
  { name: "عنبري دافئ", primary: "#D97706", secondary: "#FCD34D" },
  { name: "وردي أنيق", primary: "#BE185D", secondary: "#F472B6" },
  { name: "رمادي فاخر", primary: "#374151", secondary: "#9CA3AF" },
];

const FONTS = ["Tajawal", "Cairo", "Almarai", "IBM Plex Arabic"];
const CATEGORIES_LIST = ["أزياء وملابس", "إلكترونيات", "مواد غذائية", "مستحضرات جمال", "كتب", "مفروشات", "رياضة", "أخرى"];

interface StoreData {
  name: string; slug: string; description: string; whatsappNumber: string;
  primaryColor: string; secondaryColor: string; fontFamily: string;
  category: string; shippingRate: string; defaultCurrency: string;
}

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("dukkani_token") || localStorage.getItem("bastah_token");
    if (!token) {
      toast({ title: "يرجى تسجيل الدخول أولاً", variant: "destructive" });
      setLocation("/login");
      return;
    }

    // التحقق مما إذا كان لدى المستخدم متجر بالفعل
    fetch("/api/dashboard/store", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.ok) {
        setLocation("/dashboard");
      }
    })
    .catch(() => {});
  }, [setLocation]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StoreData>({
    name: "", slug: "", description: "", whatsappNumber: "",
    primaryColor: "#991B1B", secondaryColor: "#DC2626",
    fontFamily: "Tajawal", category: "", shippingRate: "0", defaultCurrency: "YER",
  });

  const set = (k: keyof StoreData, v: string) => setData(p => ({ ...p, [k]: v }));

  // توليد slug تلقائي من الاسم
  const handleNameChange = (v: string) => {
    set("name", v);
    set("slug", v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("dukkani_token") || localStorage.getItem("bastah_token");
      const res = await fetch("/api/auth/store/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error || "فشل إنشاء المتجر");
      toast({ title: "🎉 تم إنشاء متجرك في دكاني بنجاح!" });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl" style={{ fontFamily: "Tajawal, sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div onClick={() => setLocation("/")} className="cursor-pointer">
          <DukkaniLogo variant="crimson" size="md" />
        </div>
        <span className="text-gray-600 text-sm font-semibold">إعداد المتجر الجديد</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${done ? "bg-green-500 text-white" : active
                    ? "text-white" : "bg-gray-200 text-gray-400"}`}
                  style={active ? { background: "linear-gradient(135deg,#7C3AED,#A78BFA)" } : {}}>
                  {done ? <Check size={18} /> : <Icon size={18} />}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-xs font-medium ${active ? "text-purple-700" : "text-gray-500"}`}>{s.title}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 ${step > s.id ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {/* ─── STEP 1: معلومات المتجر ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">معلومات متجرك</h2>
              <p className="text-gray-500 text-sm">هذه البيانات ستظهر لعملائك في المتجر</p>

              <div>
                <Label>اسم المتجر *</Label>
                <Input className="mt-1 h-11" placeholder="مثال: عبايات لمياء" value={data.name}
                  onChange={e => handleNameChange(e.target.value)} />
              </div>

              <div>
                <Label>رابط المتجر *</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm">
                    dukkani.store/
                  </span>
                  <Input className="rounded-r-none h-11" dir="ltr" placeholder="my-store"
                    value={data.slug} onChange={e => set("slug", e.target.value)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">رابطك: <b>dukkani.store/{data.slug || "my-store"}</b></p>
              </div>

              <div>
                <Label>وصف المتجر</Label>
                <textarea className="mt-1 w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="اكتب وصفاً قصيراً يعرّف بمتجرك ومنتجاتك..."
                  value={data.description} onChange={e => set("description", e.target.value)} />
              </div>

              <div>
                <Label>نوع المتجر</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {CATEGORIES_LIST.map(cat => (
                    <button key={cat} type="button"
                      onClick={() => set("category", cat)}
                      className={`py-2 px-3 rounded-lg text-sm border transition-all
                        ${data.category === cat
                          ? "border-purple-500 bg-purple-50 text-purple-700 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: المظهر ─── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">هوية متجرك البصرية</h2>
              <p className="text-gray-500 text-sm">اختر الألوان والخط الذي يعبّر عن علامتك التجارية</p>

              <div>
                <Label className="mb-2 block">اللون الرئيسي</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {THEMES.map(t => (
                    <button key={t.name} type="button" onClick={() => { set("primaryColor", t.primary); set("secondaryColor", t.secondary); }}
                      className={`relative aspect-square rounded-xl border-2 transition-all ${data.primaryColor === t.primary ? "border-gray-900 scale-110" : "border-transparent"}`}
                      style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}>
                      {data.primaryColor === t.primary && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Check size={20} strokeWidth={3} />
                        </div>
                      )}
                      <span className="sr-only">{t.name}</span>
                    </button>
                  ))}
                </div>
                {/* Custom color */}
                <div className="flex items-center gap-3 mt-3">
                  <input type="color" value={data.primaryColor}
                    onChange={e => set("primaryColor", e.target.value)}
                    className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <Input value={data.primaryColor} onChange={e => set("primaryColor", e.target.value)}
                    className="w-32 h-10 font-mono text-sm" dir="ltr" />
                  <span className="text-sm text-gray-500">لون مخصص</span>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">نوع الخط</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map(f => (
                    <button key={f} type="button" onClick={() => set("fontFamily", f)}
                      style={{ fontFamily: f }}
                      className={`py-3 rounded-lg border text-sm transition-all
                        ${data.fontFamily === f
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {f} — أهلاً بك في دُكّـانـي
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl overflow-hidden border">
                <div className="h-16 flex items-center justify-center text-white font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`, fontFamily: data.fontFamily }}>
                  {data.name || "اسم متجرك"}
                </div>
                <div className="p-4 bg-white" style={{ fontFamily: data.fontFamily }}>
                  <p className="text-gray-600 text-sm">{data.description || "وصف المتجر يظهر هنا..."}</p>
                  <button className="mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ background: data.primaryColor }}>
                    تسوق الآن
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 3: الإعدادات ─── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-900">إعدادات التجارة</h2>
              <p className="text-gray-500 text-sm">إعدادات الشحن والتواصل مع العملاء</p>

              <div>
                <Label>رقم واتساب للطلبات *</Label>
                <Input className="mt-1 h-11" dir="ltr" placeholder="+966501234567"
                  value={data.whatsappNumber} onChange={e => set("whatsappNumber", e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">ستصلك إشعارات الطلبات الجديدة فورياً</p>
              </div>

              <div>
                <Label>تكلفة الشحن الافتراضية (ريال)</Label>
                <Input type="number" min="0" className="mt-1 h-11" dir="ltr"
                  value={data.shippingRate} onChange={e => set("shippingRate", e.target.value)} />
              </div>

              <div>
                <Label className="mb-2 block">العملة الافتراضية</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["SAR", "AED", "KWD", "USD", "EGP", "QAR"].map(c => (
                    <button key={c} type="button" onClick={() => set("defaultCurrency", c)}
                      className={`py-2 rounded-lg border text-sm font-mono transition-all
                        ${data.defaultCurrency === c
                          ? "border-purple-500 bg-purple-50 text-purple-700 font-semibold"
                          : "border-gray-200 text-gray-600"}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* ملخص */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-gray-700 mb-3">ملخص المتجر</p>
                {[
                  ["الاسم", data.name || "—"],
                  ["الرابط", `dukkani.store/${data.slug}` || "—"],
                  ["النوع", data.category || "—"],
                  ["الواتساب", data.whatsappNumber || "—"],
                  ["الشحن", `${data.shippingRate} ${data.defaultCurrency}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800 dir-ltr">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" disabled={step === 1} onClick={() => setStep(s => s - 1)}>
              <ArrowLeft size={16} className="ml-1" />
              السابق
            </Button>

            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && (!data.name || !data.slug)}
                style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }}>
                التالي
                <ArrowRight size={16} className="mr-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading || !data.whatsappNumber}
                style={{ background: "linear-gradient(135deg,#059669,#047857)" }}>
                {loading ? "جارٍ الإنشاء..." : "🚀 أنشئ متجري!"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          يمكنك تعديل جميع هذه الإعدادات لاحقاً من لوحة التحكم
        </p>
      </div>
    </div>
  );
}
