import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingCart, Settings, ExternalLink, Store } from "lucide-react";
import { useGetDashboardStore } from "@workspace/api-client-react";

const links = [
  { href: "/dashboard",            label: "Overview",    icon: LayoutDashboard },
  { href: "/dashboard/products",   label: "Products",    icon: Package },
  { href: "/dashboard/categories", label: "Categories",  icon: Tag },
  { href: "/dashboard/orders",     label: "Orders",      icon: ShoppingCart },
  { href: "/dashboard/settings",   label: "Settings",    icon: Settings },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: store, isLoading, error } = useGetDashboardStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading dashboard…</p>
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
    <div className="min-h-screen flex w-full bg-[#f8f9fb]">
      {/* Sidebar */}
      <aside className="w-60 border-r border-gray-200 bg-white flex-col hidden md:flex shrink-0 shadow-sm">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base text-gray-900 tracking-tight">
              Seller<span className="text-primary">Hub</span>
            </span>
          </div>
          {store && (
            <p className="text-xs text-muted-foreground font-medium ml-10 truncate">{store.name}</p>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {store && (
          <div className="px-3 py-4 border-t border-gray-100">
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all w-full"
            >
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
              View My Store
            </a>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 z-50 shadow-lg">
        {links.slice(0, 5).map(link => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isActive ? "text-primary" : "text-gray-400"}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold uppercase tracking-wide">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
