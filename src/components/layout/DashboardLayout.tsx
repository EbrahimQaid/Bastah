import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingCart, Settings, ExternalLink, Store, Menu, X, ChevronRight } from "lucide-react";
import { useGetDashboardStore } from "@/services/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/dashboard",            label: "نظرة عامة",    enLabel: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/products",   label: "المنتجات",     enLabel: "Products",    icon: Package },
  { href: "/dashboard/categories", label: "الأقسام",      enLabel: "Categories",  icon: Tag },
  { href: "/dashboard/orders",     label: "الطلبات",      enLabel: "Orders",      icon: ShoppingCart },
  { href: "/dashboard/settings",   label: "الإعدادات",    enLabel: "Settings",    icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: store, isLoading, error } = useGetDashboardStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-bold tracking-tight">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    if (location !== "/dashboard/setup") {
      window.location.href = "/dashboard/setup";
      return null;
    }
  }

  return (
    <div className="min-h-screen flex w-full bg-[#f8faff] font-sans selection:bg-primary/10 selection:text-primary" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-l border-gray-100 flex-col hidden lg:flex shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.02)] sticky top-0 h-screen z-40">
        {/* Brand Logo Area */}
        <div className="px-8 py-10 flex flex-col items-center border-b border-gray-50">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 mb-4 transform hover:scale-105 transition-transform">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-black text-xl text-gray-900 tracking-tight flex items-center gap-1">
            Seller<span className="text-primary">Hub</span>
          </h1>
          {store && (
            <div className="mt-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100 max-w-full">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest truncate">{store.name}</p>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">القائمة الرئيسية</p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-white"}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span>{link.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-6">
          {store && (
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              عرض المتجر
            </a>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Mobile Only */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
               <Store className="w-5 h-5 text-white" />
             </div>
             <span className="font-black text-lg text-gray-900">SellerHub</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32 lg:pb-12">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-[101] lg:hidden flex flex-col"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black text-xl">SellerHub</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg bg-gray-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 p-6 space-y-2">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                        isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-6 border-t border-gray-50">
                 {store && (
                   <a
                    href={`/store/${store.slug}`}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 text-white rounded-2xl font-bold"
                   >
                    <ExternalLink className="w-4 h-4" />
                    عرض المتجر
                   </a>
                 )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
