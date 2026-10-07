import { useState } from "react";
import { useLocation } from "wouter";
import { useInitDashboardStore, getGetDashboardStoreQueryKey } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Store, ArrowLeft } from "lucide-react";
import DukkaniLogo from "@/components/ui/DukkaniLogo";

export default function Setup() {
  const [, setLocation] = useLocation();
  const initStore = useInitDashboardStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    whatsappNumber: "",
    defaultCurrency: "SAR",
    primaryColor: "#991B1B",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    initStore.mutate(
      { data: form },
      {
        onSuccess: () => {
          toast({ title: "تم إنشاء وتجهيز متجرك بنجاح!" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "تعذر إعداد المتجر، يرجى المحاولة مرة أخرى", variant: "destructive" });
        },
      },
    );
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-zinc-950 p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-xs border border-neutral-200/80 dark:border-zinc-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex justify-center mb-2">
            <DukkaniLogo size="md" />
          </div>
          <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
            تهيئة متجرك الرقمي
          </h1>
          <p className="text-xs text-neutral-500 dark:text-zinc-400">
            أدخل البيانات الأساسية لإطلاق واجهة متجرك الإلكتروني واستقبال الطلبات.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">اسم المتجر</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: متجر النخبة"
              className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">معرّف الرابط (Slug)</Label>
            <Input
              required
              dir="ltr"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="elite-store"
              className="h-10 text-xs font-mono bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
            />
            <p className="text-[11px] text-neutral-400">
              سيكون رابط متجرك: <span className="font-mono text-neutral-600 dark:text-zinc-300">/store/{form.slug || "slug"}</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">رقم الواتساب للتواصل</Label>
            <Input
              required
              dir="ltr"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="+967771234567"
              className="h-10 text-xs font-mono bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">وصف مختصر للمتجر</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="مثال: أرقى العطور والأزياء التقليدية الفاخرة"
              className="h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">العملة الافتراضية</Label>
            <select
              value={form.defaultCurrency}
              onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value })}
              className="w-full px-3 h-10 text-xs bg-neutral-50 dark:bg-zinc-800/60 border border-neutral-200 dark:border-zinc-700 rounded-xl font-bold text-neutral-800 dark:text-zinc-200 focus:outline-hidden"
            >
              <option value="SAR">ريال سعودي (SAR - ر.س)</option>
              <option value="YER">ريال يمني (YER - ﷼)</option>
              <option value="USD">دولار أمريكي (USD - $)</option>
              <option value="AED">درهم إماراتي (AED - د.إ)</option>
            </select>
          </div>

          <div className="space-y-1.5 pb-2">
            <Label className="text-xs font-bold text-neutral-700 dark:text-zinc-300">اللون الأساسي للهوية</Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                className="w-10 h-10 p-0 border border-neutral-200 dark:border-zinc-700 rounded-lg cursor-pointer"
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="flex-1 font-mono text-xs h-10 bg-neutral-50 dark:bg-zinc-800/60 border-neutral-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
            disabled={initStore.isPending}
          >
            {initStore.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>إتمام التهيئة والانتقال للوحة التحكم</span>
                <ArrowLeft className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
