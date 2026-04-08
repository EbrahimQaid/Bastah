import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, Home, Search } from "lucide-react";
import { useGetStore } from "@workspace/api-client-react";

export function StoreLayout({ children, storeSlug }: { children: React.ReactNode; storeSlug: string }) {
  const { totalItems } = useCart();
  const { data: store, isLoading } = useGetStore(storeSlug, { query: { enabled: !!storeSlug } });
  const [location] = useLocation();

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
    return <div className="min-h-screen flex items-center justify-center font-bold text-lg">Store not found</div>;
  }

  return (
    <div 
      className="min-h-[100dvh] w-full max-w-md mx-auto bg-background flex flex-col relative shadow-2xl overflow-hidden border-x border-border/20"
      style={store.primaryColor ? { '--store-primary': store.primaryColor } as React.CSSProperties : {}}
    >
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-border/40 px-5 py-4 flex items-center justify-between transition-all shadow-sm">
        <Link href={`/store/${storeSlug}`} className="flex items-center gap-3">
          {store.logoImage && (
            <img src={store.logoImage} alt={store.name} className="w-9 h-9 rounded-full object-cover shadow-sm" />
          )}
          <span className="font-sans text-xl font-black tracking-tight text-foreground">
            {store.name}
          </span>
        </Link>
        <div className="flex items-center gap-5 text-foreground">
          <Link href={`/store/${storeSlug}/products`}>
            <Search className="w-5 h-5 hover:text-primary transition-colors cursor-pointer" />
          </Link>
          <Link href={`/store/${storeSlug}/cart`} className="relative hover:text-primary transition-colors cursor-pointer">
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center animate-in zoom-in border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
        {children}
      </main>

      <nav className="absolute bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-border/40 px-6 pt-3 pb-safe-offset-3 flex justify-around items-center z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <Link href={`/store/${storeSlug}`} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${location === `/store/${storeSlug}` ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <Home className={`w-6 h-6 transition-all ${location === `/store/${storeSlug}` ? "scale-110" : ""}`} />
            {location === `/store/${storeSlug}` && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link href={`/store/${storeSlug}/products`} className={`flex flex-col items-center gap-1.5 transition-colors p-2 ${location.includes('/products') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <Search className={`w-6 h-6 transition-all ${location.includes('/products') ? "scale-110" : ""}`} />
            {location.includes('/products') && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Shop</span>
        </Link>
        <Link href={`/store/${storeSlug}/cart`} className={`flex flex-col items-center gap-1.5 transition-colors relative p-2 ${location.includes('/cart') || location.includes('/checkout') ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <div className="relative">
            <ShoppingBag className={`w-6 h-6 transition-all ${location.includes('/cart') || location.includes('/checkout') ? "scale-110" : ""}`} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {totalItems}
              </span>
            )}
            {(location.includes('/cart') || location.includes('/checkout')) && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
        </Link>
      </nav>
    </div>
  );
}