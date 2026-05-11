import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import NotFound from "@/pages/not-found";
import { motion } from "framer-motion";
import { ShoppingBag, BarChart3, MessageCircle, Smartphone, Zap, Globe, ArrowRight, Check, Star } from "lucide-react";

// Store Pages
import StoreHome from "@/pages/store/Home";
import StoreProductList from "@/pages/store/ProductList";
import StoreProductDetail from "@/pages/store/ProductDetail";
import StoreCart from "@/pages/store/Cart";
import StoreCheckout from "@/pages/store/Checkout";

// Dashboard Pages
import DashboardOverview from "@/pages/dashboard/Overview";
import DashboardProducts from "@/pages/dashboard/Products";
import DashboardProductForm from "@/pages/dashboard/ProductForm";
import DashboardCategories from "@/pages/dashboard/Categories";
import DashboardOrders from "@/pages/dashboard/Orders";
import DashboardOrderDetail from "@/pages/dashboard/OrderDetail";
import DashboardSettings from "@/pages/dashboard/Settings";
import DashboardSetup from "@/pages/dashboard/Setup";

const queryClient = new QueryClient();

const FEATURES = [
  {
    icon: ShoppingBag,
    title: "Beautiful Mini-Store",
    titleAr: "متجر أنيق",
    desc: "Your own branded storefront with custom colors, fonts, and images. Share a single link — customers can browse, filter, and buy.",
    descAr: "متجرك المميز بألوانك وخطوطك وصورك. شارك رابطاً واحداً — يتصفح العملاء ويشترون بسهولة.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Orders",
    titleAr: "طلبات واتساب",
    desc: "Every new order lands silently in your WhatsApp. Customers never see your number — everything is seamless and professional.",
    descAr: "كل طلب جديد يصل مباشرة على واتساب. العملاء لا يرون رقمك — كل شيء احترافي وسلس.",
  },
  {
    icon: BarChart3,
    title: "Seller Dashboard",
    titleAr: "لوحة البائع",
    desc: "Manage products, categories, and orders from a clean dashboard. Track new, contacted, and completed orders in one place.",
    descAr: "أدر منتجاتك وفئاتك وطلباتك من لوحة تحكم بسيطة. تتبع الطلبات الجديدة والمكتملة في مكان واحد.",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    titleAr: "عملات متعددة",
    desc: "Sell in USD, SAR, AED, YER, EUR, or GBP. Your customers see prices in their local currency automatically.",
    descAr: "بيع بالدولار، الريال، الدرهم، اليورو أو الجنيه. يرى عملاؤك الأسعار بعملتهم المحلية تلقائياً.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    titleAr: "مصمم للجوال",
    desc: "Designed for mobile shoppers with smooth animations, swipe carousels, and a sticky checkout bar.",
    descAr: "مصمم للتسوق من الهاتف مع انيميشن سلس وكاروسيل للصور وشريط الدفع الثابت.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    titleAr: "إعداد فوري",
    desc: "Create your store in minutes. No code, no complicated setup — just add your products and share your link.",
    descAr: "أنشئ متجرك في دقائق. لا برمجة، لا إعداد معقد — فقط أضف منتجاتك وشارك رابطك.",
  },
];

const STEPS = [
  { n: "01", title: "Create your store",   titleAr: "أنشئ متجرك",    desc: "Set your store name, colors, and WhatsApp number.",         descAr: "حدد اسم متجرك، ألوانك، ورقم واتساب." },
  { n: "02", title: "Add your products",   titleAr: "أضف منتجاتك",   desc: "Upload photos, set prices, sizes, and categories.",          descAr: "ارفع الصور، حدد الأسعار، المقاسات والفئات." },
  { n: "03", title: "Share your link",     titleAr: "شارك رابطك",    desc: "Send your store link on WhatsApp, Instagram, anywhere.",     descAr: "أرسل رابط متجرك على واتساب، انستقرام، في أي مكان." },
  { n: "04", title: "Receive orders",      titleAr: "استقبل الطلبات", desc: "Orders arrive on your WhatsApp — contact and confirm.",     descAr: "تصلك الطلبات على واتساب — تواصل وأكد." },
];

const REVIEWS = [
  { name: "Sarah M.",  nameAr: "سارة م.",   stars: 5, text: "My boutique sales doubled in the first month!",           textAr: "مبيعات بوتيكي تضاعفت في الشهر الأول!" },
  { name: "Ahmed K.",  nameAr: "أحمد ك.",   stars: 5, text: "So easy to manage orders directly from WhatsApp.",        textAr: "سهل جداً إدارة الطلبات مباشرة من واتساب." },
  { name: "Fatima A.", nameAr: "فاطمة أ.",  stars: 5, text: "The best tool for small sellers in the Gulf.",            textAr: "أفضل أداة للبائعين الصغار في الخليج." },
];

function LandingPage() {
  const isAr = document.documentElement.lang === "ar";

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-xl font-black tracking-tight text-gray-900">Pocket<span className="text-[#C1121F]">Shop</span></span>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors hidden sm:block">Dashboard</a>
            <a href="/store/demo-store" className="px-4 py-2 bg-[#C1121F] text-white text-sm font-bold rounded-full hover:bg-[#a00e19] transition-colors shadow-sm">
              View Demo →
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80"
            alt="hero"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/80 to-gray-950" />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 pt-24 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C1121F]/20 text-[#ff6b6b] text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" /> The WhatsApp-Powered Store Builder
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
              Your store.<br />
              <span className="text-[#C1121F]">Your brand.</span><br />
              Zero hassle.
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Launch a beautiful online shop in minutes. Manage everything through WhatsApp — no apps, no complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/dashboard/setup"
                className="px-8 py-4 bg-[#C1121F] text-white font-bold rounded-2xl hover:bg-[#a00e19] transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-base"
              >
                Start for Free <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/store/demo-store"
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/15 border border-white/20 transition-all flex items-center justify-center gap-2 text-base"
              >
                See Live Demo
              </a>
            </div>
          </motion.div>

          {/* Floating store preview card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden text-left"
          >
            <div className="h-40 relative">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80"
                alt="store preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <p className="text-white font-black text-xl">layla</p>
                  <p className="text-white/70 text-xs tracking-widest uppercase">Fashion Boutique</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[
                { name: "Silk Blend Blouse", price: "$50", img: "https://images.unsplash.com/photo-1485462537746-965f33f4f4d4?w=120&q=70" },
                { name: "Floral Midi Dress",  price: "$90", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=120&q=70" },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                  <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold text-xs">{p.name}</p>
                    <p className="text-[#C1121F] font-bold text-sm">{p.price}</p>
                  </div>
                  <button className="text-[10px] font-bold bg-[#C1121F] text-white px-2.5 py-1 rounded-full">Add</button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-gray-50 border-y border-gray-100 py-5">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-500 font-medium">
          {["Free to start", "No credit card needed", "Works on any phone", "Arabic & English", "6 currencies supported"].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {t}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Everything you need to sell online</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Built for small sellers who want a professional presence without the complexity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-[#C1121F]/20 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-[#C1121F]/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-[#C1121F]" />
              </div>
              <h3 className="font-black text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-950 text-white py-20">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Up and running in 4 steps</h2>
            <p className="text-gray-400 max-w-md mx-auto">From zero to selling in under 10 minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-[#C1121F] font-black text-5xl opacity-30 mb-3 leading-none">{s.n}</div>
                <h3 className="font-black text-white text-base mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">Loved by sellers</h2>
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-gray-400 text-sm">5.0 average · 200+ happy sellers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{r.text}"</p>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">— {r.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#C1121F] text-white py-20">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Ready to launch your store?</h2>
          <p className="text-white/80 mb-10 leading-relaxed">Join hundreds of sellers growing their business with PocketShop.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard/setup"
              className="px-8 py-4 bg-white text-[#C1121F] font-black rounded-2xl hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center gap-2 text-base"
            >
              Create My Store <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/store/demo-store"
              className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/15 transition-all flex items-center justify-center gap-2 text-base"
            >
              Explore Demo Store
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span className="font-black text-gray-700">Pocket<span className="text-[#C1121F]">Shop</span></span>
          <div className="flex gap-6">
            <a href="/store/demo-store" className="hover:text-gray-700 transition-colors">Demo Store</a>
            <a href="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</a>
          </div>
          <span>© 2026 PocketShop. Built for sellers.</span>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />

      {/* Customer Store Routes */}
      <Route path="/store/:storeSlug" component={StoreHome} />
      <Route path="/store/:storeSlug/products" component={StoreProductList} />
      <Route path="/store/:storeSlug/products/:productId" component={StoreProductDetail} />
      <Route path="/store/:storeSlug/cart" component={StoreCart} />
      <Route path="/store/:storeSlug/checkout" component={StoreCheckout} />

      {/* Seller Dashboard Routes */}
      <Route path="/dashboard" component={DashboardOverview} />
      <Route path="/dashboard/products" component={DashboardProducts} />
      <Route path="/dashboard/products/new" component={DashboardProductForm} />
      <Route path="/dashboard/products/:productId/edit" component={DashboardProductForm} />
      <Route path="/dashboard/categories" component={DashboardCategories} />
      <Route path="/dashboard/orders" component={DashboardOrders} />
      <Route path="/dashboard/orders/:orderId" component={DashboardOrderDetail} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/dashboard/setup" component={DashboardSetup} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
