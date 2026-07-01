import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-violet-100 p-4" dir="rtl" style={{ fontFamily: "Tajawal, sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: "linear-gradient(135deg,#7C3AED,#A78BFA)" }}>ب</div>
          <span className="text-xl font-bold text-gray-900">بَسطة</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">مرحباً بعودتك</h1>
        <p className="text-gray-500 text-sm mb-6">سجّل دخولك للوصول إلى لوحة تحكم متجرك</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" required dir="ltr" placeholder="you@example.com"
              className="mt-1 h-11" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password">كلمة المرور</Label>
              <button type="button" className="text-xs text-purple-600 hover:underline">نسيت كلمة المرور؟</button>
            </div>
            <div className="relative mt-1">
              <Input id="password" type={showPass ? "text" : "password"} required
                placeholder="••••••••" className="h-11 pl-10" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold"
            style={{ background: "linear-gradient(135deg,#7C3AED,#6D28D9)" }}>
            {loading ? "جارٍ الدخول..." : <span className="flex items-center gap-2">دخول <ArrowRight size={18} /></span>}
          </Button>

          <p className="text-center text-sm text-gray-500">
            ليس لديك حساب؟{" "}
            <button type="button" onClick={() => setLocation("/register")} className="text-purple-600 font-semibold hover:underline">
              أنشئ متجرك مجاناً
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
