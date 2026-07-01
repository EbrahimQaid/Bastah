import React from "react";
import { Link, useLocation } from "wouter";
import BastahLogo from "@/components/ui/BastahLogo";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  ShoppingBag,
  Zap,
  Shield,
  TrendingUp,
  Smartphone,
  MessageSquare,
  Settings,
  Coins,
  ChevronLeft,
  Globe,
  Palette,
  Package,
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleStartFree = () => {
    setLocation("/register");
  };

  const handleLogin = () => {
    setLocation("/login");
  };

  const features = [
    {
      icon: Zap,
      title: "متجر جاهز في دقائق",
      desc: "خطوات بسيطة لإعداد متجرك الإلكتروني وإطلاقه للجمهور دون الحاجة لأي خبرة برمجية.",
      color: "from-purple-500 to-indigo-500",
    },
    {
      icon: MessageSquare,
      title: "إشعارات واتساب فورية",
      desc: "تلقى تفاصيل الطلبات فوراً مع روابط دفع وسرعة وسلاسة للتواصل المباشر مع العملاء.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Palette,
      title: "تخصيص كامل للهوية",
      desc: "تحكم بالألوان والخطوط والخلفيات لكي يطابق متجرك هويتك التجارية بنسبة 100%.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Coins,
      title: "دعم تعدد العملات",
      desc: "بيع لعملائك بالعملة المحلية مع أسعار صرف مرنة ودقيقة وسهلة الحساب تلقائياً.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: "لوحة تحكم إحصائية",
      desc: "تقارير بيع متكاملة ومؤشرات أداء تمكنك من متابعة نمو أرباحك وتطور متجرك بسهولة.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "استقرار وأمان دائم",
      desc: "حماية بياناتك وبيانات عملائك باستضافة سحابية متقدمة تضمن استقرار متجرك على مدار الساعة.",
      color: "from-violet-500 to-fuchsia-500",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "أنشئ حسابك الشخصي",
      desc: "سجل بياناتك الأساسية خلال دقيقة واحدة فقط.",
    },
    {
      num: "02",
      title: "أدخل معلومات متجرك",
      desc: "حدد اسم المتجر، الرابط (Slug)، والعملة الافتراضية.",
    },
    {
      num: "03",
      title: "أضف منتجاتك وبطاقاتك",
      desc: "ارفع صور المنتجات، الأسعار، والأقسام بسهولة تامة.",
    },
    {
      num: "04",
      title: "ابدأ البيع واستقبل الأرباح",
      desc: "شارك رابط متجرك واستقبل الطلبات مباشرة على واتساب.",
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-400 overflow-x-hidden"
      dir="rtl"
      style={{ fontFamily: "Tajawal, sans-serif" }}
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="cursor-pointer">
              <BastahLogo variant="light" />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              المميزات
            </a>
            <a href="#steps" className="hover:text-white transition-colors">
              كيف يعمل؟
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              الأسعار
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              الأسئلة الشائعة
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
            >
              دخول البائع
            </button>
            <button
              onClick={handleStartFree}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              أنشئ متجرك مجاناً
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32 max-w-7xl mx-auto px-6 text-center relative">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            منصة التجارة الإلكترونية العربية الأبسط لنمو تجارتك
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15] mb-6 text-white">
            أنشئ متجرك الإلكتروني الاحترافي
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-emerald-400 via-teal-300 to-indigo-400">
              في أقل من 5 دقائق وبدون تعقيد
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            منصة <b className="text-slate-200">بَسطة</b> تمكنك من تحويل مشروعك أو
            بسطتك التقليدية إلى متجر رقمي متكامل بألوانك الخاصة. تحكم بمنتجاتك،
            واستقبل طلباتك فورياً على الواتساب.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={handleStartFree}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              ابدأ الآن مجاناً
              <ArrowLeft className="w-5 h-5" />
            </button>
            <a
              href="/store/bastah"
              target="_blank"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold text-base hover:bg-slate-700/80 transition-all border border-slate-700/50 flex items-center justify-center gap-2"
            >
              تصفح متجر عينة
              <ShoppingBag className="w-5 h-5 text-slate-400" />
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-slate-800/40 border border-slate-800/60 backdrop-blur-sm max-w-4xl mx-auto">
            {[
              { value: "0 ر.س", label: "تكلفة التأسيس" },
              { value: "+3,000", label: "متاجر نشطة" },
              { value: "100%", label: "تحكم بالهوية والألوان" },
              { value: "دقيقة واحدة", label: "متوسط وقت الطلب" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center border-l last:border-l-0 border-slate-800/60"
              >
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-20 max-w-5xl mx-auto relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-purple-500/5">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
          <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700/60">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 bg-slate-900/60 rounded-md py-1 text-xs text-slate-500 font-mono tracking-wider max-w-sm mx-auto">
              dashboard.bastah.store
            </div>
          </div>
          <div className="p-4 bg-slate-900/50 flex gap-4 min-h-[300px]">
            {/* Sidebar Mock */}
            <div className="w-1/4 rounded-xl bg-slate-900/80 border border-slate-800 p-3 hidden sm:flex flex-col gap-2">
              <div className="h-6 w-16 bg-slate-800 rounded-md mb-4" />
              <div className="h-8 bg-emerald-500/10 text-emerald-400 rounded-lg" />
              <div className="h-8 bg-slate-800/40 rounded-lg" />
              <div className="h-8 bg-slate-800/40 rounded-lg" />
            </div>
            {/* Main Mock */}
            <div className="flex-1 flex flex-col gap-4 text-right" dir="rtl">
              <div className="flex justify-between items-center">
                <div className="h-8 w-32 bg-slate-800 rounded-lg" />
                <div className="h-5 w-20 bg-slate-800 rounded-lg" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 bg-slate-800/40 rounded-xl p-3 border border-slate-850">
                  <div className="h-3 w-12 bg-slate-800 rounded mb-2" />
                  <div className="h-6 w-16 bg-slate-700 rounded" />
                </div>
                <div className="h-20 bg-slate-800/40 rounded-xl p-3 border border-slate-850">
                  <div className="h-3 w-12 bg-slate-800 rounded mb-2" />
                  <div className="h-6 w-16 bg-slate-700 rounded" />
                </div>
                <div className="h-20 bg-slate-800/40 rounded-xl p-3 border border-slate-850">
                  <div className="h-3 w-12 bg-slate-800 rounded mb-2" />
                  <div className="h-6 w-16 bg-slate-700 rounded" />
                </div>
              </div>
              <div className="h-28 bg-slate-800/20 border border-slate-800/60 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              كل ما تحتاجه لإطلاق وإدارة تجارتك
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              وفرنا لك بيئة عمل متكاملة تركز على ما يهمك فعلياً: عرض منتجاتك بطريقة
              جذابة واستقبال طلبات العملاء بيسر ودون تعقيد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 rounded-2xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.01] duration-300"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${feat.color} text-slate-950 mb-6 shadow-lg shadow-slate-950/20 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="steps" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              خطوات بسيطة لإطلاق بسطتك الرقمية
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              لا تتطلب منصتنا أي خطط معقدة؛ ابدأ فوراً بخطوات سريعة وسهلة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-6 bg-slate-800/20 border border-slate-800/80 rounded-2xl hover:bg-slate-800/40 transition-colors">
                <span className="absolute top-4 left-4 text-4xl font-black text-emerald-500/20 font-mono">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-white mb-3 mt-6">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-24 border-t border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              خطط أسعار واضحة ومرنة
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              ابدأ مجاناً واكتشف ميزات المنصة، ثم انتقل للباقة الاحترافية للحصول على كامل الصلاحيات.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                  الباقة الأساسية
                </span>
                <h3 className="text-2xl font-black text-white mt-4">الباقة المجانية</h3>
                <p className="text-slate-500 text-xs mt-2">مثالية للمبتدئين لاستكشاف المنصة</p>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">0</span>
                  <span className="text-slate-400 text-sm">ريال / شهرياً</span>
                </div>
                <ul className="space-y-3.5 border-t border-slate-800/80 pt-6">
                  {[
                    "إضافة حتى 10 منتجات",
                    "أقسام وتصنيفات غير محدودة",
                    "تخصيص ألوان محدود",
                    "إشعارات الطلبات على البريد",
                    "عملة افتراضية واحدة (SAR)",
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleStartFree}
                className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-sm transition-all"
              >
                سجل مجاناً
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500 relative flex flex-col justify-between shadow-xl shadow-emerald-500/5">
              <div className="absolute -top-3.5 right-6 text-xs font-black text-slate-950 px-3 py-1 rounded-full bg-emerald-400 shadow-md">
                الأكثر طلباً
              </div>
              <div>
                <span className="text-xs font-bold text-purple-400 px-2.5 py-1 rounded-full bg-purple-400/10 border border-purple-400/20">
                  باقة النمو الاحترافي
                </span>
                <h3 className="text-2xl font-black text-white mt-4">باقة بسطة الاحترافية</h3>
                <p className="text-slate-400 text-xs mt-2">للتجار الراغبين بالتميز والنمو غير المحدود</p>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">99</span>
                  <span className="text-slate-400 text-sm">ريال / شهرياً</span>
                </div>
                <ul className="space-y-3.5 border-t border-slate-800/80 pt-6">
                  {[
                    "عدد منتجات غير محدود",
                    "تحكم كامل بالهوية والألوان والخطوط",
                    "إشعارات فورية على الواتساب مباشرة",
                    "دعم تعدد العملات (6 عملات)",
                    "دعم فني مخصص ومتكامل",
                    "تحليلات وإحصائيات متقدمة",
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-200">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleStartFree}
                className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-sm transition-all"
              >
                اشترك الآن وابدأ البيع
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white mb-4">
              الأسئلة الأكثر شيوعاً
            </h2>
            <p className="text-slate-400 text-sm">
              أجوبة سريعة على أهم استفساراتك حول منصة بسطة
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "هل يجب توفر خبرة تقنية لإنشاء متجر؟",
                a: "أبداً. تم تصميم منصة بسطة لتكون سهلة الاستخدام للغاية للجميع. يمكنك ملء الخانات، اختيار الألوان، ورفع المنتجات دون معرفة سطر برمجي واحد.",
              },
              {
                q: "كيف تتم عملية الدفع واستلام الأموال؟",
                a: "في البداية، يتم إرسال طلبات الشراء تلقائياً إلى رقم الواتساب الخاص بك، ومن ثم يمكنك تأكيد تفاصيل التوصيل والدفع مع العميل مباشرة. كما يمكنك تفعيل بوابات دفع إلكترونية لاحقاً.",
              },
              {
                q: "هل يمكنني تعديل ألوان المتجر وهويته؟",
                a: "نعم. الباقة الاحترافية تمكنك من التعديل الكامل والشامل على المظهر بما في ذلك اللون الأساسي واللون الفرعي ونوع الخط والوصف والشعار وغيرها.",
              },
              {
                q: "هل هناك عمولات على المبيعات؟",
                a: "لا تأخذ منصة بسطة أي نسبة أو عمولة من مبيعاتك. تدفع فقط اشتراك الباقة الثابت وتستمتع بكامل أرباحك.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-slate-800/30 border border-slate-800 text-right"
              >
                <h4 className="text-base font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-20 md:py-24 relative overflow-hidden bg-gradient-to-tr from-violet-900/40 via-slate-900 to-emerald-950/30 border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            حوّل بسطتك إلى متجر عالمي اليوم!
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            انضم إلى آلاف التجار العرب الذين وثقوا بـ بسطة لبدء مسيرتهم في التجارة الرقمية.
          </p>
          <button
            onClick={handleStartFree}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
          >
            أنشئ متجرك مجاناً الآن
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <BastahLogo variant="light" />
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} بَسطة (Bastah). جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">شروط الاستخدام</span>
            <span className="hover:text-white cursor-pointer transition-colors">سياسة الخصوصية</span>
            <span className="hover:text-white cursor-pointer transition-colors">تواصل معنا</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
