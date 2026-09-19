import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListDashboardOrders } from "@/services/api";
import { Link } from "wouter";
import { ShoppingCart, Search, ChevronLeft, Calendar, User, Clock, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "all" | "new" | "contacted" | "completed";

const STATUS_CONFIG = {
  new:       { label: "جديد",       color: "bg-blue-50 text-blue-600 border-blue-100",   dot: "bg-blue-500" },
  contacted: { label: "تم التواصل", color: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500" },
  completed: { label: "مكتمل",       color: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { label: status, color: "bg-gray-50 text-gray-600 border-gray-100", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function Orders() {
  const { data: orders, isLoading } = useListDashboardOrders();
  const [activeTab, setActiveTab] = useState<Status>("all");
  const [search, setSearch] = useState("");

  const filtered = orders?.filter(o => {
    const matchesStatus = activeTab === "all" || o.status === activeTab;
    const matchesSearch = !search || o.customerName.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  }) ?? [];

  const counts = {
    all:       orders?.length ?? 0,
    new:       orders?.filter(o => o.status === "new").length ?? 0,
    contacted: orders?.filter(o => o.status === "contacted").length ?? 0,
    completed: orders?.filter(o => o.status === "completed").length ?? 0,
  };

  const tabs: { key: Status; label: string }[] = [
    { key: "all",       label: "الكل" },
    { key: "new",       label: "جديد" },
    { key: "contacted", label: "تم التواصل" },
    { key: "completed", label: "مكتمل" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">إدارة الطلبات</h1>
            <p className="text-gray-400 font-medium mt-1">تتبع وإدارة طلبات عملائك من هنا.</p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="text-center border-l border-gray-100 pl-4 last:border-0 last:pl-0">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">إجمالي الطلبات</p>
                <p className="text-xl font-black text-gray-900">{counts.all}</p>
             </div>
             <div className="text-center border-l border-gray-100 pl-4 last:border-0 last:pl-0">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">بانتظار المراجعة</p>
                <p className="text-xl font-black text-amber-600">{counts.new}</p>
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">تم تسليمها</p>
                <p className="text-xl font-black text-emerald-600">{counts.completed}</p>
             </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="flex flex-wrap gap-1 w-full lg:w-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-3 rounded-2xl text-xs font-black transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 w-full group">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="البحث باسم العميل أو رقم الطلب…"
              className="w-full pr-12 pl-6 py-3.5 text-sm bg-gray-50/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/10 transition-all font-bold"
            />
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-500 rounded-2xl text-xs font-black hover:bg-gray-100 transition-all">
             <Filter className="w-4 h-4" />
             تصفية متقدمة
          </button>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-white border border-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] py-24 text-center"
          >
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="font-black text-gray-900 text-lg">لا توجد طلبات في هذا القسم</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-[250px] mx-auto font-medium">ستظهر الطلبات الجديدة هنا بمجرد قيام العملاء بالشراء من متجرك.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((order, i) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <div className="group bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10 transition-all duration-500 cursor-pointer">
                      {/* Customer Info */}
                      <div className="flex items-center gap-5 flex-1 min-w-0 w-full">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xl font-black text-primary border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                          {order.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors">{order.customerName}</h3>
                          <div className="flex items-center gap-4 mt-1">
                             <span className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                طلب #{order.id}
                             </span>
                             <span className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleDateString("ar-SA", { month: "long", day: "numeric" })}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Info */}
                      <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-10 border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                        <div className="flex flex-col items-center md:items-end">
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">المجموع</span>
                           <p className="text-xl font-black text-gray-900">${order.total.toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-2">
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">الحالة</span>
                           <StatusBadge status={order.status} />
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:-translate-x-2">
                           <ChevronLeft className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
