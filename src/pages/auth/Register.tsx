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
import DukkaniLogo from "@/components/ui/DukkaniLogo";

/* ── الميزات الظاهرة على يسار الصفحة ── */
const FEATURES = [
  { icon: Zap, text: "أنشئ دكانك في أقل من 3 دقائق" },
  { icon: ShieldCheck, text: "بيانات محمية وآمنة 100%" },
  { icon: Store, text: "تحكم كامل في مظهر دكانك" },
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
      localStorage.setItem("dukkani_token", data.token);
      localStorage.setItem("dukkani_user", JSON.stringify(data.user));
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
          <div onClick={() => setLocation("/")} className="cursor-pointer mb-10 inline-block">
            <DukkaniLogo variant="crimson" size="md" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            أنشئ دكانك الآن
          </h1>
          <p className="text-gray-500 mb-8">
            انضم إلى آلاف التجار على منصة دُكّـانـي
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
                placeholder="967771234567+"
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
              className="w-full h-12 text-base font-semibold mt-2 text-white shadow-lg shadow-red-600/25 bg-[#E4122C] hover:bg-[#CC0A22]"
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
                className="text-[#E4122C] font-semibold hover:underline"
              >
                سجّل الدخول
              </button>
            </p>

            <p className="text-center text-xs text-gray-400">
              بالتسجيل، أنت توافق على{" "}
              <span className="text-[#E4122C] cursor-pointer hover:underline">
                شروط الاستخدام
              </span>{" "}
              و{" "}
              <span className="text-[#E4122C] cursor-pointer hover:underline">
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
            "linear-gradient(135deg, #8E0010 0%, #CC0A22 50%, #E4122C 100%)",
        }}
      >
        <div className="max-w-md">
          <div onClick={() => setLocation("/")} className="cursor-pointer mb-12 inline-block">
            <DukkaniLogo variant="light" size="lg" />
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            دُكّـانك الرقمي بين يديك
            <br />
            <span className="text-amber-300">في 3 دقائق</span>
          </h2>

          <p className="text-rose-100 text-lg mb-10 leading-relaxed">
            أنشئ دكانك الاحترافي وابدأ البيع اليوم بكل سهولة. بدون خبرة تقنية،
            وداعم للمحافظ والعملات اليمنية.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-emerald-100">{text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                س
              </div>
              <div>
                <p className="text-sm text-emerald-50 leading-relaxed">
                  "أنشأت متجري في أقل من 10 دقائق وبدأت أستقبل طلبات في نفس اليوم عبر الواتساب!"
                </p>
                <p className="text-emerald-200 text-xs mt-2">سارة محمد — صاحبة متجر عبايات وأزياء</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { value: "+3,500", label: "دكان نشط" },
              { value: "+80K", label: "طلب مكتمل" },
              { value: "4.9★", label: "تقييم التجار" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-emerald-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
