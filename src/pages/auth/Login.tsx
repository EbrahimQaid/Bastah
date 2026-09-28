import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
      if (!res.ok) throw new Error((await res.json()).error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      const data = await res.json();
      localStorage.setItem("dukkani_token", data.token);
      localStorage.setItem("dukkani_user", JSON.stringify(data.user));
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
    <div
      className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-zinc-950 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl shadow-xs p-6 sm:p-8">
        {/* Brand & Return */}
        <div className="flex items-center justify-between mb-8">
          <div onClick={() => setLocation("/store")} className="cursor-pointer">
            <DukkaniLogo size="md" />
          </div>
          <button
            onClick={() => setLocation("/store")}
            className="text-xs font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            العودة للمتجر
          </button>
        </div>

        <h1 className="text-xl font-black text-neutral-900 dark:text-white mb-1">
          تسجيل دخول التاجر
        </h1>
        <p className="text-xs text-neutral-500 dark:text-zinc-400 mb-6">
          أدخل بيانات حسابك للوصول إلى لوحة إدارة متجرك والطلبات.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-neutral-700 dark:text-zinc-300 font-bold text-xs">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              required
              dir="ltr"
              placeholder="name@domain.com"
              className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-white rounded-xl focus:border-red-600 focus:ring-red-600"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-neutral-700 dark:text-zinc-300 font-bold text-xs">
                كلمة المرور
              </Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                required
                dir="ltr"
                placeholder="••••••••"
                className="h-10 pl-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 text-neutral-900 dark:text-white rounded-xl focus:border-red-600 focus:ring-red-600"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-zinc-200 transition-colors p-1"
                aria-label={showPass ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-xs font-bold mt-4 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-xl shadow-xs"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>دخول لوحة التحكم</span>
                <ArrowLeft size={16} />
              </span>
            )}
          </Button>

          <p className="text-center text-xs text-neutral-500 dark:text-zinc-400 mt-6">
            ليس لديك متجر بعد؟{" "}
            <button
              type="button"
              onClick={() => setLocation("/register")}
              className="text-red-600 font-bold hover:underline"
            >
              سجّل متجرك الجديد
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
