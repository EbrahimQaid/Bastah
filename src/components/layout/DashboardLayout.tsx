import { Link, useLocation, Redirect } from "wouter";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Settings,
  ExternalLink,
  Store,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { useGetDashboardStore } from "@/services/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DukkaniLogo from "@/components/ui/DukkaniLogo";

const links = [
  { href: "/dashboard",            label: "نظرة عامة",    icon: LayoutDashboard },
  { href: "/dashboard/products",   label: "المنتجات",     icon: Package },
  { href: "/dashboard/categories", label: "الأقسام",      icon: Tag },
  { href: "/dashboard/orders",     label: "الطلبات",      icon: ShoppingCart },
  { href: "/dashboard/settings",   label: "الإعدادات",    icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: store, isLoading, error } = useGetDashboardStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("dukkani_token");
    localStorage.removeItem("dukkani_user");
    localStorage.removeItem("bastah_token");
    localStorage.removeItem("bastah_user");
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-bold tracking-tight">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    const hasToken = localStorage.getItem("dukkani_token") || localStorage.getItem("bastah_token");
    const isAuthError = (error as any)?.message?.includes("401") || !hasToken;
    if (isAuthError) {
      localStorage.removeItem("dukkani_token");
      localStorage.removeItem("dukkani_user");
      localStorage.removeItem("bastah_token");
      localStorage.removeItem("bastah_user");
      return <Redirect to="/login" />;
    }
    if (location !== "/dashboard/setup") {
      return <Redirect to="/dashboard/setup" />;
    }
  }

  const storeName = store?.name || "دكاني";

  return (
    <div className="min-h-screen flex w-full bg-neutral-50/80 dark:bg-zinc-950 text-neutral-900 dark:text-zinc-100 font-sans" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white dark:bg-zinc-900 border-l border-neutral-200/80 dark:border-zinc-800 hidden lg:flex flex-col shrink-0 sticky top-0 h-screen z-40">
        {/* Brand Area */}
        <div className="px-6 py-6 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <DukkaniLogo size="sm" />
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
            مباشر
          </span>
        </div>

        {/* Store Identifier */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-neutral-700 dark:text-zinc-300 shrink-0">
              <Store className="w-4 h-4 text-red-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{storeName}</p>
              <p className="text-[11px] text-neutral-400 truncate">لوحة إدارة المتجر</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">
            إدارة التجارة
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800/60 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-zinc-200"}`} />
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronLeft className="w-3.5 h-3.5 opacity-80" />}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-neutral-100 dark:border-zinc-800 space-y-2">
          <a
            href="/store"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-neutral-900 text-xs font-bold transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>معاينة متجر العملاء</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-zinc-900 border-b border-neutral-200/80 dark:border-zinc-800 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <Link href="/dashboard" className="flex items-center gap-2">
            <DukkaniLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="/store"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-zinc-800 transition-colors"
              title="معاينة المتجر"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 hover:bg-neutral-200 transition-colors"
              aria-label="القائمة"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-900 z-50 lg:hidden flex flex-col border-l border-neutral-200 dark:border-zinc-800"
            >
              <div className="p-5 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
                <DukkaniLogo size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-neutral-100 dark:border-zinc-800">
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{storeName}</p>
                <p className="text-[11px] text-neutral-400">لوحة التحكم</p>
              </div>

              <div className="flex-1 p-3 space-y-1 overflow-y-auto">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-red-600 text-white"
                          : "text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-neutral-100 dark:border-zinc-800 space-y-2">
                <a
                  href="/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl font-bold text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  معاينة المتجر
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl font-bold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  تسجيل الخروج
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
