import React from "react";
import { Link, useLocation } from "wouter";
import DukkaniLogo from "@/components/ui/DukkaniLogo";
import {
  ArrowLeft,
  Check,
  ShoppingBag,
  Zap,
  Shield,
  TrendingUp,
  MessageSquare,
  Coins,
  Palette,
  Sparkles,
  Smartphone,
  Star,
  Clock,
  HeartHandshake,
  CheckCircle2,
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
      title: "دكّان جاهز في 3 دقائق",
      desc: "خطوات فائقة البساطة لإعداد دكانك الإلكتروني وإطلاقه للجمهور فوراً دون الحاجة لأي خبرة تقنية أو تعقيدات.",
      color: "from-rose-500 to-red-600",
      bg: "bg-rose-50 text-[#E4122C]",
    },
    {
      icon: MessageSquare,
      title: "إشعارات وطلبات واتساب فورية",
      desc: "يصلك إشعار الطلب فوراً إلى رسائل الواتساب مع بيانات العميل والمنتجات لتأكيد التوصيل بكل سهولة وسرعة.",
      color: "from-emerald-600 to-green-600",
      bg: "bg-green-50 text-green-600",
    },
    {
      icon: Coins,
      title: "دعم الريال اليمني والعملات",
      desc: "بيع لعملائك بالريال اليمني (القديم والجديد)، الريال السعودي، والدولار مع تحويل عملات فوري ومرن.",
      color: "from-amber-500 to-yellow-600",
      bg: "bg-amber-50 text-amber-600",
    },
    {
      icon: Shield,
      title: "جاهز للمحافظ والبنوك اليمنية",
      desc: "عرض أرقام حساباتك للدفع مباشرة عبر بنك الكريمي (حساب أو جوال)، ون كاش، فلوسك، وشبكات الحوالات.",
      color: "from-red-600 to-rose-700",
      bg: "bg-rose-50 text-[#E4122C]",
    },
    {
      icon: Palette,
      title: "هوية وألوان على ذوقك",
      desc: "تحكم بألوان المتجر والشعار والصور وطريقة العرض ليكون دكانك يعكس هوية تجارتك بلمسة عصرية جذابة.",
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50 text-[#E4122C]",
    },
    {
      icon: TrendingUp,
      title: "أرباحك كاملة 100% بدون عمولات",
      desc: "لا نأخذ أي نسبة أو عمولة من مبيعاتك؛ كل ريال تحققه من تجارتك يدخل دكانك وجيبك بالكامل وبكل شفافية.",
      color: "from-rose-600 to-red-700",
      bg: "bg-rose-50 text-[#E4122C]",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "أنشئ حسابك بدقيقة",
      desc: "سجل اسمك ورقم هاتفك بدون تعقيد.",
      icon: Clock,
    },
    {
      num: "02",
      title: "سمّ دكانك واختر رابطك",
      desc: "حدد اسم دكانك وعملتك المفضلة.",
      icon: Smartphone,
    },
    {
      num: "03",
      title: "أضف منتجاتك وأسعارك",
      desc: "ارفع الصور والأسعار بلمسات بسيطة وسريعة.",
      icon: ShoppingBag,
    },
    {
      num: "04",
      title: "شارك رابطك وابدأ البيع",
      desc: "انشر رابط دكانك واستقبل الطلبات على واتساب!",
      icon: HeartHandshake,
    },
  ];

  return (
    <div
      className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden selection:bg-rose-100 selection:text-rose-900"
      dir="rtl"
      style={{ fontFamily: "'Alexandria', 'Tajawal', sans-serif" }}
    >
      {/* ── Soft Vibrant Ambient Lights ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-gradient-to-b from-rose-100/40 via-red-50/20 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-40 left-10 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/">
            <div className="cursor-pointer">
              <DukkaniLogo variant="crimson" size="md" />
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-[#E4122C] transition-colors">
              المميزات
            </a>
            <a href="#preview" className="hover:text-[#E4122C] transition-colors">
              معاينة المتجر
            </a>
            <a href="#steps" className="hover:text-[#E4122C] transition-colors">
              كيف يعمل؟
            </a>
            <a href="#pricing" className="hover:text-[#E4122C] transition-colors">
              الأسعار
            </a>
            <a href="#faq" className="hover:text-[#E4122C] transition-colors">
              الأسئلة الشائعة
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#E4122C] transition-colors"
            >
              دخول التاجر
            </button>
            <button
              onClick={handleStartFree}
              className="px-5 py-2.5 rounded-2xl bg-[#E4122C] text-white font-black text-xs sm:text-sm shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/35 hover:bg-[#CC0A22] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              أنشئ دكانك مجاناً
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-5 sm:px-8 text-center relative">
        <div className="max-w-4xl mx-auto">
          {/* Friendly Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-[#E4122C] text-xs font-bold mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#E4122C] animate-ping" />
            <span>دُكّـانك الرقمي بين يديك • منصة دُكّـانـي للتجارة الذكية والسهلة</span>
          </div>

          {/* Main Logo & Wordmark Highlight */}
          <div className="flex justify-center mb-6">
            <DukkaniLogo variant="crimson" size="xl" layout="vertical" />
          </div>

          {/* Grand Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.2] mb-6 text-slate-900">
            افتح دُكّـانـك الرقمي في 3 دقائق
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4122C] via-rose-600 to-[#CC0A22]">
              دُكّانك الرقمي بين يديك.. وبكل بساطة!
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            ودّع التكاليف والتعقيد البرمجي! منصة <b className="text-[#E4122C]">دُكّـانـي</b> صُممت خصيصاً للشباب وتجار اليمن؛ أضف منتجاتك بسهولة، واستقبل طلبات زبائنك مباشرة على الواتساب مع دعم الدفع بـ <b className="text-slate-900">الريال اليمني، بنك الكريمي، وون كاش</b> بدون أي عمولة على مبيعاتك.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={handleStartFree}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E4122C] text-white font-black text-base shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:bg-[#CC0A22] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-2.5"
            >
              <span>افتح دكانك الآن مجاناً</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <a
              href="/store"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-800 hover:text-[#E4122C] font-bold text-base hover:bg-slate-50 transition-all border border-slate-200/90 shadow-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-[#E4122C]" />
              <span>تصفح دكاناً حياً (عينة)</span>
            </a>
          </div>

          {/* Key Trust Stats Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl mx-auto">
            {[
              { value: "0 ﷼", label: "رسوم تأسيس مجانية" },
              { value: "+3,500", label: "دكان ومتجر نشط" },
              { value: "100%", label: "جاهز للمحافظ والواتساب" },
              { value: "3 دقائق", label: "لإطلاق دكانك بالكامل" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center border-l last:border-l-0 border-slate-100 py-1"
              >
                <div className="text-xl sm:text-2xl font-black text-[#E4122C]">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 font-bold mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive Live Store Phone Preview (In Jeeb's Clean Style) ── */}
        <div id="preview" className="mt-16 sm:mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#E4122C] px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80">
              واجهة دكانك على هواتف العملاء
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              سريعة، أنيقة، وتفتح النفس للمشتري!
            </h3>
          </div>

          {/* Phone Frame Mockup */}
          <div className="relative max-w-sm sm:max-w-md mx-auto bg-slate-900 rounded-[44px] p-3.5 shadow-[0_25px_60px_-15px_rgba(228,18,44,0.25)] border-4 border-slate-800">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900/60" />
            </div>

            {/* Phone Screen Screen */}
            <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 text-right">
              {/* Store App Header */}
              <div className="bg-[#E4122C] px-4 py-3.5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs">
                    د
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-black text-sm">
                      <span>دُكّان النخبة اليمانية</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    </div>
                    <span className="text-[10px] text-rose-100 block">دكانك الرقمي السريع</span>
                  </div>
                </div>

                {/* Currency Switcher Pill */}
                <div className="bg-white/15 px-2 py-0.5 rounded-full text-[10px] font-bold border border-white/20">
                  ﷼ YER
                </div>
              </div>

              {/* Store Promo Banner */}
              <div className="bg-gradient-to-r from-rose-50 to-red-50 p-3.5 border-b border-rose-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-[#E4122C] bg-rose-100 px-2 py-0.5 rounded-md">
                    خصم الافتتاح 10%
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1">كود الخصم: DUKKANI10</p>
                </div>
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>

              {/* Sample Product Cards */}
              <div className="p-3.5 space-y-3 bg-slate-50/50">
                {/* Product 1 */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl bg-rose-50 flex items-center justify-center text-[#E4122C] text-xl font-black shrink-0">
                    ☕
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 truncate">بُن يمني حرازي فاخر</span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">محصول مختص أصيل درجة أولى</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-[#E4122C]">8,500 ﷼</span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#E4122C] text-white text-[10px] font-black">
                        طلب سريع ✓
                      </span>
                    </div>
                  </div>
                </div>

                {/* Product 2 */}
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl font-black shrink-0">
                    🍯
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 truncate">عسل سدر دوعني ملكي</span>
                      <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>5.0</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">نقي ومضمون 100% عالي الجودة</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-black text-[#E4122C]">19,000 ﷼</span>
                      <span className="px-2.5 py-1 rounded-lg bg-[#E4122C] text-white text-[10px] font-black">
                        طلب سريع ✓
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supported Wallets Strip in Mock */}
              <div className="p-3 bg-white border-t border-slate-100 text-center">
                <span className="text-[9.5px] font-bold text-slate-400 block mb-1.5">
                  طرق الدفع المتوفرة لعملائك في دكانك
                </span>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black border border-emerald-100">
                    الكريمي جوال
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-black border border-amber-100">
                    حوالة مصرفية
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-black border border-blue-100">
                    ون كاش
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-black">
                    دفع عند الاستلام
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 md:py-28 border-y border-slate-200/70 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#E4122C] text-xs font-bold mb-4">
              مميزات صُممت لنجاح دكانك
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              كل ما تحتاجه لإطلاق تجارتك بسهولة
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              وفرنا لك بيئة عمل ذكية وسريعة تركز على ما يهمك فعلياً: عرض بضاعتك بشكل فخم واستقبال طلبات الزبائن مباشرة على واتساب دون وسيط أو عمولة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 rounded-3xl bg-slate-50/60 border border-slate-200/80 hover:border-red-500/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feat.color} mb-6 shadow-md shadow-red-500/15 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2.5 group-hover:text-[#E4122C] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="steps" className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-4">
              كيف تبدأ؟
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              4 خطوات فقط ودكانك الرقمي جاهز
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              منصة بسيطة، سهلة جداً، تناسب الجميع من أصحاب المتاجر والمشاريع المنزلية والشباب الطموح.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative p-7 bg-white border border-slate-200/80 rounded-3xl shadow-xs hover:shadow-lg hover:border-red-300 transition-all group"
                >
                  <span className="absolute top-5 left-5 text-4xl font-black text-red-500/15 font-mono group-hover:text-red-500/30 transition-colors">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E4122C] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 md:py-28 border-t border-slate-200/70 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#E4122C] text-xs font-bold mb-4">
              باقات تناسب الجميع
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              خطط واضحة بدون رسوم خفية
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              ابدأ مجاناً الآن، وعندما تتوسع تجارتك يمكنك الترقية إلى الباقة الاحترافية لمزايا غير محدودة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/90 relative flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600 px-3 py-1 rounded-full bg-white border border-slate-200">
                  الباقة الأساسية
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-4">الباقة المجانية</h3>
                <p className="text-slate-500 text-xs mt-1.5">مثالية لبدء مشروعك وتجربة المنصة فوراً</p>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">0</span>
                  <span className="text-slate-500 text-sm">ريال / مجاناً للأبد</span>
                </div>
                <ul className="space-y-3.5 border-t border-slate-200/80 pt-6">
                  {[
                    "إضافة حتى 10 منتجات",
                    "أقسام وتصنيفات غير محدودة",
                    "إشعارات الطلبات على الواتساب مباشرة",
                    "دعم الريال اليمني والعملات الأساسية",
                    "رابط دكان خاص بك لمشاركته مع الزبائن",
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Check className="w-4 h-4 text-[#E4122C] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleStartFree}
                className="w-full mt-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-black text-sm transition-all shadow-xs"
              >
                سجل وابدأ دكانك مجاناً
              </button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-rose-50/50 to-white border-2 border-[#E4122C] relative flex flex-col justify-between shadow-xl shadow-red-600/10">
              <div className="absolute -top-3.5 right-6 text-xs font-black text-slate-900 px-3.5 py-1 rounded-full bg-amber-400 shadow-md">
                الأكثر طلباً للتجار 🌟
              </div>
              <div>
                <span className="text-xs font-bold text-[#E4122C] px-3 py-1 rounded-full bg-rose-100 border border-rose-200">
                  باقة النمو الاحترافي
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-4">باقة دُكّـانـي الاحترافية</h3>
                <p className="text-slate-500 text-xs mt-1.5">للتجار الراغبين بالتميز وبناء علامة تجارية قوية</p>
                <div className="my-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-[#E4122C]">4,900</span>
                  <span className="text-slate-500 text-sm">﷼ يمني / شهرياً (أو 10$ دولار)</span>
                </div>
                <ul className="space-y-3.5 border-t border-rose-100 pt-6">
                  {[
                    "عدد منتجات غير محدود بالكامل",
                    "تخصيص الهوية، الألوان، الخطوط والشعار",
                    "ربط كامل بمحافظ اليمن (الكريمي، جيب، ون كاش)",
                    "إشعارات فورية سريعة على الواتساب",
                    "تقارير مبيعات وأرباح دقيقة وتصدير بيانات",
                    "أولوية في الدعم الفني والمساعدة",
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-800">
                      <Check className="w-4 h-4 text-[#E4122C] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={handleStartFree}
                className="w-full mt-8 py-3.5 rounded-2xl bg-[#E4122C] hover:bg-[#CC0A22] text-white font-black text-sm transition-all shadow-lg shadow-red-600/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                اشترك الآن وابدأ البيع
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[#E4122C] text-xs font-bold mb-4">
              الأسئلة الشائعة
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">
              إجابات سريعة تهمك
            </h2>
            <p className="text-slate-600 text-sm">
              كل ما تريد معرفته عن منصة دُكّـانـي وطريقة عملها في اليمن
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "هل أحتاج خبرة تقنية لفتح دكاني؟",
                a: "أبداً وبأي حال! منصة دُكّـانـي صُممت لتكون مثل استخدام الواتساب؛ مجرد تعبئة بيانات وصور وتحديد أسعار، ويصبح دكانك جاهزاً للزبائن بثوانٍ.",
              },
              {
                q: "كيف يستلم التاجر أرباحه في اليمن؟",
                a: "تضيف بياناتك المفضلة (رقم حسابك في بنك الكريمي أو الكريمي جوال، ون كاش، فلوسك، أو استلام الحوالات). وعندما يطلب الزبون، تصله هذه البيانات في رسالة الواتساب لتأكيد التحويل مباشرة.",
              },
              {
                q: "هل تدعم المنصة البيع بالريال اليمني؟",
                a: "نعم بالتأكيد! المنصة تدعم العملة المحلية الريال اليمني (YER) القديم والجديد، بالإضافة للريال السعودي والدولار، مع محول عملات فوري لتسهيل التسوق.",
              },
              {
                q: "هل تأخذ منصة دُكّـانـي عمولة على المبيعات؟",
                a: "لا تأخذ منصة دُكّـانـي أي نسبة أو عمولة من مبيعاتك. كل ريال تربحه هو لك بالكامل 100%.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-right"
              >
                <h4 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-rose-50 text-[#E4122C] flex items-center justify-center text-xs font-black shrink-0">
                    ؟
                  </span>
                  {faq.q}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed mr-8.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final Call to Action ── */}
      <section className="py-20 md:py-24 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="rounded-[36px] bg-gradient-to-br from-[#E4122C] via-[#CC0A22] to-[#8E0010] text-white p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-red-700/25">
          {/* Subtle light glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <DukkaniLogo variant="light" size="lg" iconOnly />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4">
              حوّل تجارتك إلى دُكّـان رقمي ذكي اليوم!
            </h2>
            <p className="text-rose-100 text-base sm:text-lg mb-8 leading-relaxed">
              دُكّانك الرقمي بين يديك وعلى طول معك.. انضم لآلاف الشباب والتجار الذين بدأوا تجارتهم الإلكترونية بكل ثقة ويسر.
            </p>
            <button
              onClick={handleStartFree}
              className="px-9 py-4 rounded-2xl bg-white text-[#E4122C] font-black text-base shadow-xl hover:bg-rose-50 hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-2"
            >
              <span>أنشئ دكانك مجاناً الآن</span>
              <ArrowLeft className="w-5 h-5 text-[#E4122C]" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 border-t border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <DukkaniLogo variant="crimson" size="md" />
          <p className="text-xs text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} دُكّـانـي (Dukkani) • دُكّانك الرقمي بين يديك.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500 font-bold">
            <span className="hover:text-[#E4122C] cursor-pointer transition-colors">شروط الاستخدام</span>
            <span className="hover:text-[#E4122C] cursor-pointer transition-colors">سياسة الخصوصية</span>
            <span className="hover:text-[#E4122C] cursor-pointer transition-colors">تواصل معنا</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
