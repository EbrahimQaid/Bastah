import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats, useListDashboardOrders, useGetDashboardStore } from "@/services/api";
import { Link } from "wouter";
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowLeft, Clock, CheckCircle2, MessageCircle, ExternalLink, Users } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  new:       { label: "جديد",       color: "bg-blue-50 text-blue-600 border-blue-100",   dot: "bg-blue-500" },
  contacted: { label: "تم التواصل", color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
  completed: { label: "مكتمل",       color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { label: status, color: "bg-gray-50 text-gray-600 border-gray-100", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}>
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
      title: "إجمالي المبيعات",
      value: `$${(stats?.totalRevenue || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-violet-50 text-violet-600",
      trend: "زيادة بنسبة 12% هذا الأسبوع",
    },
    {
      title: "إجمالي الطلبات",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      trend: `${stats?.newOrders ?? 0} طلبات جديدة`,
    },
    {
      title: "طلبات جديدة",
      value: stats?.newOrders ?? 0,
      icon: TrendingUp,
      color: "bg-amber-50 text-amber-600",
      trend: "تحتاج إلى مراجعة",
    },
    {
      title: "المنتجات",
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "bg-emerald-50 text-emerald-600",
      trend: "في الكتالوج الخاص بك",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-10" dir="rtl">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
               مرحباً{store?.name ? `، ${store.name}` : ""} 👋
            </h1>
            <p className="text-gray-400 font-medium mt-2">إليك ملخص سريع لأداء متجرك اليوم.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-3 rtl:space-x-reverse items-center ml-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                  +12
                </div>
             </div>
             <p className="text-xs font-bold text-gray-400">عملاء نشطون الآن</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-white border border-gray-100 animate-pulse" />
            ))
          ) : (
            statCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${card.color}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">مباشر</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 mb-1">{card.title}</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-50 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                    </span>
                    <p className="text-[11px] text-gray-400 font-bold">{card.trend}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Orders List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-gray-50/30">
              <div>
                <h2 className="font-black text-gray-900 text-lg">أحدث الطلبات</h2>
                <p className="text-xs font-bold text-gray-400 mt-0.5">آخر المبيعات التي تمت في متجرك</p>
              </div>
              <Link href="/dashboard/orders" className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-xs font-black text-gray-600 hover:border-primary hover:text-primary transition-all">
                عرض الكل <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
            
            <div className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-8 py-6 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-gray-50" />
                       <div className="space-y-2">
                        <div className="w-32 h-4 bg-gray-50 rounded" />
                        <div className="w-20 h-3 bg-gray-50 rounded" />
                      </div>
                    </div>
                    <div className="w-24 h-8 bg-gray-50 rounded-full" />
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
                <div className="px-8 py-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="font-black text-gray-900">لا توجد طلبات بعد</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-[200px]">ستظهر الطلبات الجديدة هنا بمجرد وصولها.</p>
                </div>
              ) : (
                recentOrders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link href={`/dashboard/orders/${order.id}`}>
                      <div className="px-8 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-sm font-black text-gray-500 border border-gray-200 group-hover:scale-110 transition-transform">
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-900">{order.customerName}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <Clock className="w-3 h-3 text-gray-300" />
                               <p className="text-[11px] text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", year: "numeric" })}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <StatusBadge status={order.status} />
                          <p className="font-black text-base text-gray-900 min-w-[80px] text-left">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Side Panel: Actions & Quick Stats */}
          <div className="space-y-6">
            {/* Action Needed Card */}
            {newOrders.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 shadow-lg shadow-amber-200 text-white relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-700">
                   <Clock className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-black text-sm">تنبيه بالطلبات</h3>
                  </div>
                  <p className="text-amber-50 text-sm font-bold mb-6">
                    لديك <span className="text-white text-lg">{newOrders.length}</span> طلبات جديدة تحتاج لمراجعتك الآن.
                  </p>
                  <Link href="/dashboard/orders">
                    <button className="w-full py-3.5 bg-white text-amber-600 text-sm font-black rounded-2xl hover:bg-amber-50 transition-all shadow-md">
                      مراجعة الطلبات
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Quick Actions Panel */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
                إجراءات سريعة
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/dashboard/products/new">
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 hover:bg-primary hover:text-white group transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-colors">
                        <Package className="w-5 h-5 text-gray-600 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-black">إضافة منتج جديد</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <Link href="/dashboard/orders">
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 hover:bg-primary hover:text-white group transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-colors">
                        <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-black">إدارة الطلبات</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <Link href="/dashboard/settings">
                  <button className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gray-50 hover:bg-primary hover:text-white group transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-white/20 transition-colors">
                        <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-white" />
                      </div>
                      <span className="text-sm font-black">إعدادات المتجر</span>
                    </div>
                    <ArrowLeft className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Secondary Stats Card */}
            <div className="bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden">
               <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
               <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
               <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                       <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">طلبات مكتملة</h3>
                    </div>
                    <p className="text-5xl font-black text-white leading-tight">
                      {orders?.filter(o => o.status === "completed").length ?? 0}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-2">تم تسليمها بنجاح</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-primary" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
