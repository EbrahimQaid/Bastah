import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import BastahLogo from "@/components/ui/BastahLogo";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "بيانات خاطئة");
      const data = await res.json();
      localStorage.setItem("bastah_token", data.token);
      localStorage.setItem("bastah_user", JSON.stringify(data.user));
      // إذا لم يكمل الإعداد، أرسله للـ Onboarding
      if (!data.user.hasStore) {
        setLocation("/onboarding");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden" dir="rtl" style={{ fontFamily: "Tajawal, sans-serif" }}>
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl shadow-xl p-8 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div onClick={() => setLocation("/")} className="cursor-pointer">
            <BastahLogo variant="light" />
          </div>
          <button onClick={() => setLocation("/")} className="text-xs text-slate-400 hover:text-white transition-colors">
            العودة للرئيسية
          </button>
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">مرحباً بعودتك</h1>
        <p className="text-slate-400 text-sm mb-6">سجّل دخولك للوصول إلى لوحة تحكم متجرك</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-300">البريد الإلكتروني</Label>
            <Input id="email" type="email" required dir="ltr" placeholder="you@example.com"
              className="mt-1.5 h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-purple-500" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-300">كلمة المرور</Label>
              <button type="button" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">نسيت كلمة المرور؟</button>
            </div>
            <div className="relative mt-1.5">
              <Input id="password" type={showPass ? "text" : "password"} required
                placeholder="••••••••" className="h-11 pl-10 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-purple-500 focus:ring-purple-500" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold mt-6 text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 transition-all border-none">
            {loading ? "جارٍ الدخول..." : <span className="flex items-center gap-2">دخول لوحة التحكم <ArrowRight size={18} /></span>}
          </Button>

          <p className="text-center text-sm text-slate-400 mt-6">
            ليس لديك حساب؟{" "}
            <button type="button" onClick={() => setLocation("/register")} className="text-emerald-400 font-semibold hover:underline">
              أنشئ متجرك مجاناً
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
