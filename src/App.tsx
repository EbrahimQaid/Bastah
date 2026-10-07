import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";

// Store Pages
import StoreHome from "@/pages/store/Home";
import StoreProductList from "@/pages/store/ProductList";
import StoreProductDetail from "@/pages/store/ProductDetail";
import StoreCart from "@/pages/store/Cart";
import StoreCheckout from "@/pages/store/Checkout";
import StoreOrderSuccess from "@/pages/store/OrderSuccess";
import StoreAbout from "@/pages/store/About";

// Dashboard Pages (Code-split to isolate bundle size from shopper storefront)
const DashboardOverview = lazy(() => import("@/pages/dashboard/Overview"));
const DashboardProducts = lazy(() => import("@/pages/dashboard/Products"));
const DashboardProductForm = lazy(() => import("@/pages/dashboard/ProductForm"));
const DashboardCategories = lazy(() => import("@/pages/dashboard/Categories"));
const DashboardOrders = lazy(() => import("@/pages/dashboard/Orders"));
const DashboardOrderDetail = lazy(() => import("@/pages/dashboard/OrderDetail"));
const DashboardSettings = lazy(() => import("@/pages/dashboard/Settings"));
const DashboardSetup = lazy(() => import("@/pages/dashboard/Setup"));

const queryClient = new QueryClient();

// ─── Auth Guard: يحمي مسارات لوحة التحكم ───────────────────────
function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const token = typeof window !== "undefined"
    ? (localStorage.getItem("dukkani_token") || localStorage.getItem("bastah_token"))
    : null;
  if (!token) return <Redirect to="/login" />;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-zinc-950">
          <div className="w-8 h-8 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin" />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      {/* الصفحة الرئيسية → المتجر مباشرة */}
      <Route path="/">
        <Redirect to="/store" />
      </Route>

      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/onboarding">{() => <Redirect to="/dashboard/setup" />}</Route>

      {/* Customer Store Routes — single store, no slug */}
      <Route path="/store" component={StoreHome} />
      <Route path="/store/products" component={StoreProductList} />
      <Route path="/store/products/:productId" component={StoreProductDetail} />
      <Route path="/store/cart" component={StoreCart} />
      <Route path="/store/checkout" component={StoreCheckout} />
      <Route path="/store/order-success/:orderId" component={StoreOrderSuccess} />
      <Route path="/store/about" component={StoreAbout} />
      <Route path="/store/profile">{() => <Redirect to="/store/about" />}</Route>

      {/* Seller Dashboard Routes — محمية بالمصادقة */}
      <Route path="/dashboard">{() => <ProtectedRoute component={DashboardOverview} />}</Route>
      <Route path="/dashboard/products">{() => <ProtectedRoute component={DashboardProducts} />}</Route>
      <Route path="/dashboard/products/new">{() => <ProtectedRoute component={DashboardProductForm} />}</Route>
      <Route path="/dashboard/products/:productId/edit">{() => <ProtectedRoute component={DashboardProductForm} />}</Route>
      <Route path="/dashboard/categories">{() => <ProtectedRoute component={DashboardCategories} />}</Route>
      <Route path="/dashboard/orders">{() => <ProtectedRoute component={DashboardOrders} />}</Route>
      <Route path="/dashboard/orders/:orderId">{() => <ProtectedRoute component={DashboardOrderDetail} />}</Route>
      <Route path="/dashboard/settings">{() => <ProtectedRoute component={DashboardSettings} />}</Route>
      <Route path="/dashboard/setup">{() => <ProtectedRoute component={DashboardSetup} />}</Route>

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
