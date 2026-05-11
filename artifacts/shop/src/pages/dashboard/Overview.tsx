import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats, useListDashboardOrders, useGetDashboardStore } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowRight, Clock, CheckCircle2, MessageCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500" },
  contacted: { label: "Contacted", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { label: status, color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function Overview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: orders, isLoading: ordersLoading } = useListDashboardOrders();
  const { data: store } = useGetDashboardStore();

  const isLoading = statsLoading || ordersLoading;

  const newOrders = orders?.filter(o => o.status === "new") ?? [];
  const recentOrders = orders?.slice(0, 6) ?? [];

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${(stats?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-violet-50 text-violet-600",
      trend: "+12% this week",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      trend: `${stats?.newOrders ?? 0} new`,
    },
    {
      title: "New Orders",
      value: stats?.newOrders ?? 0,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      trend: "Need attention",
    },
    {
      title: "Products",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "bg-green-50 text-green-600",
      trend: "In catalog",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Good day{store?.name ? `, ${store.name}` : ""} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
          </div>
          {store && (
            <a
              href={`/store/${store.slug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              My Store
            </a>
          )}
        </div>

        {/* Stat Cards */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500">{card.title}</p>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-black text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{card.trend}</p>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900 text-base">Recent Orders</h2>
              <Link href="/dashboard/orders" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between animate-pulse">
                    <div className="space-y-2">
                      <div className="w-32 h-3.5 bg-gray-100 rounded" />
                      <div className="w-20 h-3 bg-gray-100 rounded" />
                    </div>
                    <div className="w-20 h-6 bg-gray-100 rounded-full" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No orders yet</p>
                </div>
              ) : (
                recentOrders.map(order => (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500">
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={order.status} />
                        <p className="font-black text-sm text-gray-900 w-16 text-right">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* New Orders Alert */}
            {newOrders.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="font-black text-sm text-amber-800">Action Needed</h3>
                </div>
                <p className="text-amber-700 text-sm font-medium mb-4">
                  You have <span className="font-black">{newOrders.length}</span> new order{newOrders.length !== 1 ? "s" : ""} waiting.
                </p>
                <Link href="/dashboard/orders">
                  <button className="w-full py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors">
                    Review Orders
                  </button>
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-black text-sm text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/products/new">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-sm font-semibold text-gray-600 transition-all text-left">
                    <Package className="w-4 h-4 flex-shrink-0" />
                    Add New Product
                  </button>
                </Link>
                <Link href="/dashboard/orders">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-sm font-semibold text-gray-600 transition-all text-left">
                    <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                    Manage Orders
                  </button>
                </Link>
                <Link href="/dashboard/settings">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-primary/5 hover:text-primary text-sm font-semibold text-gray-600 transition-all text-left">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    Store Settings
                  </button>
                </Link>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <h3 className="font-black text-sm text-green-800">Completed</h3>
              </div>
              <p className="text-3xl font-black text-green-700">
                {orders?.filter(o => o.status === "completed").length ?? 0}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">fulfilled orders</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
