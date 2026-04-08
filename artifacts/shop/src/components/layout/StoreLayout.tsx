import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Home, Search } from "lucide-react";
import { useGetStore } from "@workspace/api-client-react";
import { useEffect } from "react";

export function StoreLayout({ children, storeSlug }: { children: React.ReactNode; storeSlug: string }) {
  const { totalItems } = useCart();
  const { data: store, isLoading } = useGetStore(storeSlug, { query: { enabled: !!storeSlug } });
  const [location] = useLocation();

  useEffect(() => {
    if (store?.primaryColor) {
      // Hex to HSL approx for primary color variable
      // A quick hack to apply the custom color to the primary var:
      // Realistically we'd convert hex to hsl space-separated string, 
      // but for simplicity here we just use the hex directly if supported or keep default.
      document.documentElement.style.setProperty("--primary", store.primaryColor);
    }
  }, [store?.primaryColor]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted"></div>
          <div className="w-32 h-4 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!store) {
    return <div className="min-h-screen flex items-center justify-center">Store not found</div>;
  }

  return (
    <div 
      className="min-h-[100dvh] w-full max-w-md mx-auto bg-background flex flex-col relative shadow-2xl overflow-hidden border-x border-border/20"
    >
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40 px-5 py-4 flex items-center justify-between transition-all">
        <Link href={`/store/${storeSlug}`} className="flex items-center gap-3">
          {store.logoImage && (
            <img src={store.logoImage} alt={store.name} className="w-8 h-8 rounded-full object-cover" />
          )}
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            {store.name}
          </span>
        </Link>
        <div className="flex items-center gap-5 text-foreground">
          <Link href={`/store/${storeSlug}/products`}>
            <Search className="w-5 h-5 hover:text-primary transition-colors" />
          </Link>
          <Link href={`/store/${storeSlug}/cart`} className="relative hover:text-primary transition-colors">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-foreground text-background text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 bg-[#FAFAFA] dark:bg-[#111]">
        {children}
      </main>

      <nav className="absolute bottom-0 w-full bg-background/90 backdrop-blur-xl border-t border-border/40 px-6 py-4 flex justify-around items-center z-50 pb-safe">
        <Link href={`/store/${storeSlug}`} className={`flex flex-col items-center gap-1 transition-colors ${location === `/store/${storeSlug}` ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">Home</span>
        </Link>
        <Link href={`/store/${storeSlug}/products`} className={`flex flex-col items-center gap-1 transition-colors ${location.includes('/products') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-wide">Shop</span>
        </Link>
        <Link href={`/store/${storeSlug}/cart`} className={`flex flex-col items-center gap-1 transition-colors relative ${location.includes('/cart') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-3 h-3 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-wide">Cart</span>
        </Link>
      </nav>
    </div>
  );
}