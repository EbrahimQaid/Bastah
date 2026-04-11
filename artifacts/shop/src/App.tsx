import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import NotFound from "@/pages/not-found";

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

function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md p-6">
        <h1 className="text-4xl font-serif font-bold tracking-tight">PocketShop</h1>
        <p className="text-muted-foreground">The multi-vendor marketplace platform.</p>
        <div className="flex flex-col gap-4">
          <a href="/store/demo-store" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            View Demo Store
          </a>
          <a href="/dashboard" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors">
            Seller Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
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