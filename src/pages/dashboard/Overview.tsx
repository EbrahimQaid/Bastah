import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats, useListDashboardOrders, useGetDashboardStore } from "@/services/api";
import { Link } from "wouter";
import {
  Package,
  ShoppingCart,
  DollarSign,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Settings,
} from "lucide-react";

const STATUS_CONFIG = {
  new:       { label: "جديد",       color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  contacted: { label: "تم التواصل", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  completed: { label: "مكتمل",       color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    label: status,
    color: "bg-neutral-100 text-neutral-700 dark:bg-zinc-800 dark:text-zinc-300 border-neutral-200 dark:border-zinc-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function Overview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: orders, isLoading: ordersLoading } = useListDashboardOrders();
  const { data: store } = useGetDashboardStore();

  const isLoading = statsLoading || ordersLoading;
  const recentOrders = orders?.slice(0, 6) ?? [];
  const pendingOrders = orders?.filter((o) => o.status === "new") ?? [];
  const currency = store?.defaultCurrency || "ر.س";

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              لوحة التحكم
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
              متابعة مباشرة لأداء المبيعات والمخزون والطلبات الواردة لمتجر {store?.name || ""}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/products/new">
              <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-xs">
                <Plus className="w-4 h-4" />
                <span>إضافة منتج</span>
              </button>
            </Link>
            <a
              href="/store"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-neutral-100 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-xs border border-neutral-200 dark:border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>المتجر</span>
            </a>
          </div>
        </div>

        {/* Real KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-bold">إجمالي المبيعات</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
              {(stats?.totalRevenue || 0).toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{" "}
              <span className="text-xs font-sans text-neutral-500">{currency}</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">إجمالي قيمة الطلبات المسجلة</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-bold">إجمالي الطلبات</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
              {stats?.totalOrders ?? 0}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">كافة الطلبات منذ إنشاء المتجر</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-bold">بانتظار المراجعة</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tabular-nums text-amber-600">
              {pendingOrders.length}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">طلبات جديدة تحتاج تواصل وتأكيد</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-3">
              <span className="text-xs font-bold">المنتجات في الكتالوج</span>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white">
              {stats?.totalProducts ?? 0}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">منتجات معروضة ومخزنة</p>
          </div>
        </div>

        {/* Content Layout: Recent Orders & Quick Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Recent Orders List */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">أحدث الطلبات الواردة</h2>
                <p className="text-[11px] text-neutral-400">قائمة بأحدث عمليات الشراء المكتملة أو قيد الانتظار</p>
              </div>
              <Link href="/dashboard/orders">
                <button className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
                  <span>عرض الكل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            {isLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-neutral-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-16 text-center text-neutral-400 space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-bold">لا توجد طلبات واردة حتى الآن</p>
                <p className="text-[11px]">ستظهر طلبات العملاء فور إتمام الشراء عبر واجهة المتجر.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-zinc-800">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                    <div className="p-4 sm:px-5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-neutral-700 dark:text-zinc-300">
                          #{order.id}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-red-600 transition-colors">
                            {order.customerName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span>·</span>
                            <span>{order.customerPhone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <StatusBadge status={order.status} />
                        <p className="text-xs font-mono font-black text-neutral-900 dark:text-white text-left">
                          {order.total.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}{" "}
                          <span className="text-[10px] font-sans font-normal text-neutral-400">{currency}</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Shortcuts & Store Summary */}
          <div className="lg:col-span-4 space-y-4">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                إجراءات سريعة
              </h3>
              <div className="space-y-2">
                <Link href="/dashboard/products/new">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-zinc-200 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Plus className="w-4 h-4 text-red-600" />
                      <span>إضافة منتج جديد للكتالوج</span>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </Link>
                <Link href="/dashboard/orders">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-zinc-200 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <ShoppingCart className="w-4 h-4 text-blue-600" />
                      <span>معالجة طلبات العملاء</span>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </Link>
                <Link href="/dashboard/settings">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-zinc-800/60 hover:bg-neutral-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-zinc-200 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-neutral-600" />
                      <span>تعديل إعدادات المتجر والهوية</span>
                    </div>
                    <ArrowLeft className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </Link>
              </div>
            </div>

            {/* Store Information Card */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                بيانات المتجر
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-zinc-800">
                  <span className="text-neutral-500">اسم المتجر</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{store?.name || "دكاني"}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-zinc-800">
                  <span className="text-neutral-500">العملة الافتراضية</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{currency}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-neutral-500">حالة المتجر</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>متاح للعملاء</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
