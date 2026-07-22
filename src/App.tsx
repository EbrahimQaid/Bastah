import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { LanguageProvider } from "@/context/language-context";
import { CurrencyProvider } from "@/context/currency-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";

// Store Pages
import StoreHome from "@/pages/store/Home";
import StoreProductList from "@/pages/store/ProductList";
import StoreProductDetail from "@/pages/store/ProductDetail";
import StoreCart from "@/pages/store/Cart";
import StoreCheckout from "@/pages/store/Checkout";
import StoreProfile from "@/pages/store/Profile";

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

function Router() {
  return (
    <Switch>
      {/* الصفحة الرئيسية → المتجر مباشرة */}
      <Route path="/">
        <Redirect to="/store" />
      </Route>

      {/* Auth */}
      <Route path="/login" component={Login} />

      {/* Customer Store Routes — single store, no slug */}
      <Route path="/store" component={StoreHome} />
      <Route path="/store/products" component={StoreProductList} />
      <Route path="/store/products/:productId" component={StoreProductDetail} />
      <Route path="/store/cart" component={StoreCart} />
      <Route path="/store/checkout" component={StoreCheckout} />
      <Route path="/store/profile" component={StoreProfile} />

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
