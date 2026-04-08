import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, Tag, ShoppingCart, Settings, LogOut } from "lucide-react";
import { useGetDashboardStore } from "@workspace/api-client-react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: store, isLoading, error } = useGetDashboardStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  if (error || !store) {
    // If not setup, redirect or show setup
    if (location !== "/dashboard/setup") {
      window.location.href = "/dashboard/setup";
      return null;
    }
  }

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/categories", label: "Categories", icon: Tag },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex w-full bg-muted/20">
      <aside className="w-64 border-r bg-background flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-tight">Seller Hub</h2>
          {store && <p className="text-sm text-muted-foreground">{store.name}</p>}
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== "/dashboard" && location.startsWith(link.href));
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile nav placeholder */}
      <div className="md:hidden fixed bottom-0 w-full bg-background border-t flex justify-around p-3 z-50">
        {links.slice(0, 4).map(link => {
           const Icon = link.icon;
           return (
             <Link key={link.href} href={link.href} className="flex flex-col items-center text-muted-foreground">
               <Icon className="w-5 h-5" />
             </Link>
           );
        })}
      </div>
    </div>
  );
}