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
  ShieldCheck,
  Zap,
  Coins,
  MessageSquare,
} from "lucide-react";
import DukkaniLogo from "@/components/ui/DukkaniLogo";

const FEATURES = [
  { icon: Zap, title: "إنشاء المتجر في دقائق", desc: "خطوات بسيطة لإعداد كتالوجك الرقمي وإطلاقه مباشرة للعملاء." },
  { icon: ShieldCheck, title: "أمان متكامل", desc: "لوحة تحكم محمية ونظام إدارة صلاحيات وتتبع موثوق." },
  { icon: Store, title: "تحكم كامل في المتجر", desc: "إدارة المخزون، والأسعار، والأقسام، وخيارات الشحن." },
  { icon: MessageSquare, title: "إشعارات الطلبات الفورية", desc: "تصلك تفاصيل الطلبات فوراً مع بيانات العميل لتسهيل التواصل." },
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

      toast({ title: "تم إنشاء حسابك بنجاح" });
      setLocation("/onboarding");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-neutral-50 dark:bg-zinc-950" dir="rtl">
      {/* ── الجانب الأيمن: النموذج ── */}
      <div className="lg:col-span-6 flex flex-col justify-center items-center p-6 sm:p-12 bg-white dark:bg-zinc-900 border-l border-neutral-200/80 dark:border-zinc-800">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <div onClick={() => setLocation("/store")} className="cursor-pointer">
              <DukkaniLogo variant="crimson" size="sm" />
            </div>
            <button
              onClick={() => setLocation("/store")}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              العودة للمتجر
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
              إنشاء حساب تاجر جديد
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 mt-1">
              سجل بياناتك لإدارة متجرك، وتتبع الطلبات وإضافة منتجاتك بكل سهولة.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                الاسم الكامل *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="مثال: يحيى القاسمي"
                className="mt-1 h-11 bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl focus:border-red-600"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                البريد الإلكتروني *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="merchant@example.com"
                className="mt-1 h-11 bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl focus:border-red-600 font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                رقم الهاتف / الواتساب *
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+967 7X XXX XXXX"
                className="mt-1 h-11 bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl focus:border-red-600 font-mono"
                dir="ltr"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                تُرسل إشعارات وتأكيدات الطلبات لهذا الرقم
              </p>
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold text-neutral-700 dark:text-zinc-300">
                كلمة المرور * (8 أحرف على الأقل)
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-11 pl-10 bg-neutral-50 dark:bg-zinc-800 border-neutral-200 dark:border-zinc-700 text-xs sm:text-sm rounded-xl focus:border-red-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-sm font-bold mt-2 text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-transform active:scale-95"
            >
              {loading ? "جارٍ تسجيل الحساب..." : "إنشاء حساب التاجر"}
            </Button>

            <div className="text-center text-xs text-neutral-500 pt-2">
              <span>لديك حساب بالفعل؟ </span>
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-red-600 font-bold hover:underline"
              >
                تسجيل الدخول
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── الجانب الأيسر: ميزات المنصة ── */}
      <div className="hidden lg:col-span-6 lg:flex flex-col justify-center p-12 bg-neutral-900 text-white space-y-8">
        <div className="max-w-md space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-red-400">
            منصة التجارة الذكية
          </span>

          <h2 className="text-3xl font-black tracking-tight leading-tight">
            حلول متكاملة لبناء وإدارة متجرك الرقمي باحترافية
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            أنشئ واجهة متجرك، واستقبل طلبات عملائك، وتتبع عمليات البيع والمخزون في بيئة عمل متكاملة مصممة خصيصاً للتجارة السريعة.
          </p>

          <div className="space-y-4 pt-2">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-9 h-9 bg-red-600/20 text-red-400 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{title}</h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
