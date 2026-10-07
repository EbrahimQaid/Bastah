import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListDashboardOrders, useGetDashboardStore } from "@/services/api";
import { Link } from "wouter";
import { ShoppingCart, Search, Clock, ArrowLeft, Phone, MapPin } from "lucide-react";

type Status = "all" | "new" | "contacted" | "completed";

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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

export default function Orders() {
  const { data: orders, isLoading } = useListDashboardOrders();
  const { data: store } = useGetDashboardStore();
  const [activeTab, setActiveTab] = useState<Status>("all");
  const [search, setSearch] = useState("");

  const currency = store?.defaultCurrency || "ر.س";

  const filtered =
    orders?.filter((o) => {
      const matchesStatus = activeTab === "all" || o.status === activeTab;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        o.customerName.toLowerCase().includes(q) ||
        (o.customerPhone && o.customerPhone.includes(q)) ||
        String(o.id).includes(q);
      return matchesStatus && matchesSearch;
    }) ?? [];

  const counts = {
    all: orders?.length ?? 0,
    new: orders?.filter((o) => o.status === "new").length ?? 0,
    contacted: orders?.filter((o) => o.status === "contacted").length ?? 0,
    completed: orders?.filter((o) => o.status === "completed").length ?? 0,
  };

  const tabs: { key: Status; label: string }[] = [
    { key: "all",       label: "كافة الطلبات" },
    { key: "new",       label: "جديد (بانتظار المراجعة)" },
    { key: "contacted", label: "تم التواصل" },
    { key: "completed", label: "مكتمل" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              إدارة الطلبات
            </h1>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">
              متابعة وتحديث حالات طلبات العملاء وتأكيد التوصيل.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
              {counts.new} بانتظار التأكيد
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 dark:bg-zinc-800 text-neutral-500"
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف أو رقم الطلب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-8 pl-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-xl focus:outline-hidden font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl py-16 px-6 text-center space-y-3">
            <ShoppingCart className="w-10 h-10 mx-auto text-neutral-300" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">لا توجد طلبات مطابقة</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {orders && orders.length > 0
                ? "لا توجد نتائج تطابق خيارات التصفية أو البحث الحالية."
                : "لم يستقبل المتجر أي طلبات بعد. ستظهر الطلبات الجديدة هنا فور إتمام العملاء للشراء."}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-zinc-800/50 border-b border-neutral-200/80 dark:border-zinc-800 text-neutral-500 font-bold">
                    <th className="px-5 py-3.5">رقم الطلب</th>
                    <th className="px-4 py-3.5">العميل</th>
                    <th className="px-4 py-3.5">رقم الهاتف</th>
                    <th className="px-4 py-3.5">العنوان</th>
                    <th className="px-4 py-3.5">الإجمالي</th>
                    <th className="px-4 py-3.5">الحالة</th>
                    <th className="px-4 py-3.5">التاريخ</th>
                    <th className="px-5 py-3.5 text-left">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-zinc-800/80">
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-neutral-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-neutral-900 dark:text-white">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-white">
                        {order.customerName}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-neutral-600 dark:text-zinc-400 dir-ltr text-right">
                        {order.customerPhone}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500 truncate max-w-[180px]">
                        {order.customerAddress || "—"}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-neutral-900 dark:text-white">
                        {order.total.toLocaleString("ar-SA", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[10px] font-sans font-normal text-neutral-400">
                          {order.currency === "SAR" ? "ر.س" : order.currency === "YER" ? "ر.ي" : order.currency === "USD" ? "$" : (order.currency || currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 text-[11px] whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-left">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <button className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-[11px] transition-colors flex items-center gap-1">
                            <span>معاينة</span>
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
