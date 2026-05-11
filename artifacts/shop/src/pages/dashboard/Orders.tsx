import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListDashboardOrders } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ShoppingCart, Search, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type Status = "all" | "new" | "contacted" | "completed";

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500",   tab: "bg-blue-600" },
  contacted: { label: "Contacted", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500",  tab: "bg-amber-600" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", dot: "bg-green-500",  tab: "bg-green-600" },
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
    { key: "all",       label: "All" },
    { key: "new",       label: "New" },
    { key: "contacted", label: "Contacted" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Orders</h1>
            <p className="text-gray-500 text-sm mt-1">{orders?.length ?? 0} total orders</p>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  activeTab === tab.key ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer…"
              className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-3.5 bg-gray-100 rounded" />
                    <div className="w-24 h-3 bg-gray-100 rounded" />
                  </div>
                  <div className="w-20 h-6 bg-gray-100 rounded-full" />
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No orders found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-black text-primary flex-shrink-0">
                        {order.customerName.charAt(0).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-400">
                          #{order.id} · {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>

                      {/* Status */}
                      <StatusBadge status={order.status} />

                      {/* Total */}
                      <p className="font-black text-sm text-gray-900 w-20 text-right">${order.total.toFixed(2)}</p>

                      {/* Arrow */}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
