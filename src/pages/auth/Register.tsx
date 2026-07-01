import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Store,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

/* ── الميزات الظاهرة على يسار الصفحة ── */
const FEATURES = [
  { icon: Zap, text: "أنشئ متجرك في أقل من 5 دقائق" },
  { icon: ShieldCheck, text: "بيانات محمية وآمنة 100%" },
  { icon: Store, text: "تحكم كامل في مظهر متجرك" },
  { icon: Sparkles, text: "إشعارات واتساب فورية للطلبات" },
];

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast({ title: "كلمة المرور يجب أن تكون 8 أحرف على الأقل", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "فشل التسجيل");
      }

      const data = await res.json();
      // حفظ الـ token مؤقتاً
      localStorage.setItem("bastah_token", data.token);
      localStorage.setItem("bastah_user", JSON.stringify(data.user));

      toast({ title: "تم إنشاء حسابك بنجاح 🎉" });
      setLocation("/onboarding");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen grid lg:grid-cols-2"
      dir="rtl"
      style={{ fontFamily: "Tajawal, sans-serif" }}
    >
      {/* ── الجانب الأيمن: النموذج ── */}
      <div className="flex flex-col justify-center items-center p-8 bg-white">
        {/* Logo */}
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}
            >
              ب
            </div>
            <span className="text-xl font-bold text-gray-900">بَسطة</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            أنشئ متجرك الآن
          </h1>
          <p className="text-gray-500 mb-8">
            انضم إلى آلاف التجار العرب على منصة بسطة
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-700 font-medium">
                الاسم الكامل
              </Label>
              <Input
                id="fullName"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="محمد أحمد"
                className="mt-1 h-11 text-right"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1 h-11"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                رقم الجوال (واتساب)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="966501234567+"
                className="mt-1 h-11"
                dir="ltr"
              />
              <p className="text-xs text-gray-400 mt-1">
                ستصلك إشعارات الطلبات الجديدة على هذا الرقم
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">
                كلمة المرور
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="8 أحرف على الأقل"
                  className="h-11 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold mt-2"
              style={{
                background: loading
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #7C3AED, #6D28D9)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  جارٍ إنشاء الحساب...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  إنشاء الحساب
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500">
              لديك حساب بالفعل؟{" "}
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-purple-600 font-semibold hover:underline"
              >
                سجّل الدخول
              </button>
            </p>

            <p className="text-center text-xs text-gray-400">
              بالتسجيل، أنت توافق على{" "}
              <span className="text-purple-500 cursor-pointer hover:underline">
                شروط الاستخدام
              </span>{" "}
              و{" "}
              <span className="text-purple-500 cursor-pointer hover:underline">
                سياسة الخصوصية
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* ── الجانب الأيسر: Hero ── */}
      <div
        className="hidden lg:flex flex-col justify-center p-12 text-white"
        style={{
          background:
            "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #8B5CF6 100%)",
        }}
      >
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold">
              ب
            </div>
            <div>
              <p className="text-xl font-bold">بَسطة</p>
              <p className="text-purple-200 text-sm">منصة التجارة الإلكترونية العربية</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            متجرك الإلكتروني
            <br />
            <span className="text-yellow-300">في دقائق</span>
          </h2>

          <p className="text-purple-100 text-lg mb-10 leading-relaxed">
            أنشئ متجرك الاحترافي وابدأ البيع اليوم. بدون خبرة تقنية،
            بدون تعقيدات.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-purple-100">{text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                س
              </div>
              <div>
                <p className="text-sm text-purple-100 leading-relaxed">
                  "أنشأت متجري في أقل من 10 دقائق وبدأت أستقبل طلبات في نفس اليوم!"
                </p>
                <p className="text-purple-300 text-xs mt-2">سارة محمد — صاحبة متجر عبايات</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { value: "+2,500", label: "تاجر نشط" },
              { value: "+50K", label: "طلب مكتمل" },
              { value: "4.9★", label: "تقييم المتجر" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-purple-300 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
