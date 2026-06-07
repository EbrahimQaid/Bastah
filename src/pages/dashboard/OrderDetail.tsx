import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRoute, Link } from "wouter";
import {
  useGetDashboardOrder,
  useUpdateDashboardOrderStatus,
  getGetDashboardOrderQueryKey,
  getListDashboardOrdersQueryKey,
  type UpdateOrderStatusBodyStatus,
} from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, Phone, MapPin, FileText, Package, User, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = {
  new:       { label: "New",       color: "bg-blue-100 text-blue-700",   dot: "bg-blue-500",   ring: "ring-blue-200" },
  contacted: { label: "Contacted", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500",  ring: "ring-amber-200" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", dot: "bg-green-500",  ring: "ring-green-200" },
} as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? { label: status, color: "bg-gray-100 text-gray-700", dot: "bg-gray-400", ring: "ring-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const STATUS_STEPS = [
  { key: "new",       label: "Order Placed",    icon: Package },
  { key: "contacted", label: "Seller Contacted", icon: MessageSquare },
  { key: "completed", label: "Completed",        icon: CheckCircle2 },
];

export default function OrderDetail() {
  const [, params] = useRoute("/dashboard/orders/:orderId");
  const orderId = parseInt(params?.orderId || "0", 10);
  const { data: order, isLoading } = useGetDashboardOrder(orderId, {
    query: { queryKey: getGetDashboardOrderQueryKey(orderId), enabled: !!orderId },
  });
  const updateStatus = useUpdateDashboardOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (status: UpdateOrderStatusBodyStatus) => {
    updateStatus.mutate({ orderId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated successfully" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardOrderQueryKey(orderId) });
        queryClient.invalidateQueries({ queryKey: getListDashboardOrdersQueryKey() });
      }
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl animate-pulse">
          <div className="w-48 h-8 bg-gray-200 rounded-xl" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-2xl" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Order not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order #{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-100 z-0" />
            <div
              className="absolute left-0 top-5 h-0.5 bg-primary z-0 transition-all duration-500"
              style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
            />
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2 z-10">
                  <button
                    onClick={() => handleStatusChange(step.key as UpdateOrderStatusBodyStatus)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? "bg-primary border-primary text-white shadow-md"
                        : "bg-white border-gray-200 text-gray-400 hover:border-primary hover:text-primary"
                    }`}
                    title={`Set to ${step.label}`}
                    disabled={updateStatus.isPending}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-bold ${done ? "text-primary" : "text-gray-400"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Customer Info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-black text-gray-900 text-base">Customer Details</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Name</p>
                  <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <p className="font-bold text-gray-900 text-sm">{order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Address</p>
                  <p className="font-bold text-gray-900 text-sm">{order.customerAddress}</p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Notes</p>
                    <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(order.whatsappMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              Open in WhatsApp
            </a>
          </motion.div>

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-black text-gray-900 text-base">Order Items</h2>
            </div>

            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                      {item.selectedSize && (
                        <span className="text-xs bg-white text-gray-600 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="text-xs bg-white text-gray-600 px-1.5 py-0.5 rounded font-medium border border-gray-200">
                          {item.selectedColor}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-black text-gray-900 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
              <span className="font-black text-gray-900">Total</span>
              <span className="font-black text-xl text-primary">${order.total.toFixed(2)}</span>
            </div>

            {/* Status quick update */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">Update Status</p>
              <div className="flex gap-2">
                {STATUS_STEPS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => handleStatusChange(s.key as UpdateOrderStatusBodyStatus)}
                    disabled={order.status === s.key || updateStatus.isPending}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      order.status === s.key
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
