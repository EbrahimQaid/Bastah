import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import DukkaniLogo from "@/components/ui/DukkaniLogo";

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
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden" dir="rtl" style={{ fontFamily: "'Alexandria', 'Tajawal', sans-serif" }}>
      {/* Decorative Soft Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-rose-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.05)] p-8 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-between mb-8">
          <div onClick={() => setLocation("/")} className="cursor-pointer">
            <DukkaniLogo variant="crimson" size="md" />
          </div>
          <button onClick={() => setLocation("/")} className="text-xs font-bold text-slate-500 hover:text-[#E4122C] transition-colors">
            العودة للرئيسية
          </button>
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-1">مرحباً بعودتك</h1>
        <p className="text-slate-500 text-sm mb-6">سجّل دخولك للوصول إلى لوحة تحكم دكانك</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-slate-700 font-bold text-xs">البريد الإلكتروني</Label>
            <Input id="email" type="email" required dir="ltr" placeholder="you@example.com"
              className="mt-1.5 h-11 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#E4122C] focus:ring-[#E4122C] rounded-xl" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-slate-700 font-bold text-xs">كلمة المرور</Label>
              <button type="button" className="text-xs font-bold text-[#E4122C] hover:text-[#CC0A22] transition-colors">نسيت كلمة المرور؟</button>
            </div>
            <div className="relative mt-1.5">
              <Input id="password" type={showPass ? "text" : "password"} required
                placeholder="••••••••" className="h-11 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#E4122C] focus:ring-[#E4122C] rounded-xl" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold mt-6 text-white bg-[#E4122C] hover:bg-[#CC0A22] transition-all border-none rounded-2xl shadow-lg shadow-red-600/25">
            {loading ? "جارٍ الدخول..." : <span className="flex items-center justify-center gap-2">دخول لوحة التحكم <ArrowRight size={18} /></span>}
          </Button>

          <p className="text-center text-sm text-slate-500 mt-6 font-medium">
            ليس لديك حساب؟{" "}
            <button type="button" onClick={() => setLocation("/register")} className="text-[#E4122C] font-bold hover:underline">
              أنشئ دكانك مجاناً
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
