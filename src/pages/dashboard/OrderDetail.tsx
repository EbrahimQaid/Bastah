import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRoute, Link } from "wouter";
import {
  useGetDashboardOrder,
  useUpdateDashboardOrderStatus,
  useGetDashboardStore,
  getGetDashboardOrderQueryKey,
  getListDashboardOrdersQueryKey,
  type UpdateOrderStatusBodyStatus,
} from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Phone,
  MapPin,
  Package,
  User,
  CheckCircle2,
  Clock,
  MessageCircle,
  FileText,
} from "lucide-react";

const STATUS_CONFIG = {
  new:       { label: "جديد (بانتظار المراجعة)", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  contacted: { label: "تم التواصل مع العميل",   color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  completed: { label: "مكتمل وتم التسليم",       color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
} as const;

export default function OrderDetail() {
  const [, params] = useRoute("/dashboard/orders/:orderId");
  const orderId = parseInt(params?.orderId || "0", 10);
  const { data: order, isLoading } = useGetDashboardOrder(orderId, {
    query: { queryKey: getGetDashboardOrderQueryKey(orderId), enabled: !!orderId },
  });
  const { data: store } = useGetDashboardStore();
  const updateStatus = useUpdateDashboardOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const formatCurrency = (code?: string) => {
    if (!code) return store?.defaultCurrency || "ر.س";
    if (code === "SAR") return "ر.س";
    if (code === "YER") return "ر.ي";
    if (code === "USD") return "$";
    return code;
  };

  const currency = formatCurrency(order?.currency);

  const handleStatusChange = (status: UpdateOrderStatusBodyStatus) => {
    updateStatus.mutate(
      { orderId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "تم تحديث حالة الطلب بنجاح" });
          queryClient.invalidateQueries({ queryKey: getGetDashboardOrderQueryKey(orderId) });
          queryClient.invalidateQueries({ queryKey: getListDashboardOrdersQueryKey() });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl space-y-4 animate-pulse" dir="rtl">
          <div className="w-48 h-8 bg-neutral-200 dark:bg-zinc-800 rounded-xl" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-64 bg-neutral-100 dark:bg-zinc-900 rounded-2xl" />
            <div className="h-64 bg-neutral-100 dark:bg-zinc-900 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-neutral-400 space-y-3" dir="rtl">
          <Package className="w-12 h-12 mx-auto opacity-30" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-white">لم يتم العثور على الطلب</h2>
          <p className="text-xs">قد يكون الطلب غير موجود أو تم حذفه.</p>
          <Link href="/dashboard/orders">
            <button className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">
              العودة لقائمة الطلبات
            </button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const cleanPhone = order.customerPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6" dir="rtl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/orders">
              <button
                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-100 transition-colors"
                aria-label="الرجوع"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                  طلب رقم #{order.id}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.color || ""
                  }`}
                >
                  {STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]?.label || order.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">
                تاريخ الطلب:{" "}
                {new Date(order.createdAt).toLocaleDateString("ar-SA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Quick Status Action */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">تغيير الحالة:</span>
            <select
              value={order.status}
              disabled={updateStatus.isPending}
              onChange={(e) => handleStatusChange(e.target.value as UpdateOrderStatusBodyStatus)}
              className="px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 rounded-xl font-bold text-neutral-800 dark:text-zinc-200 cursor-pointer focus:outline-hidden"
            >
              <option value="new">جديد (بانتظار المراجعة)</option>
              <option value="contacted">تم التواصل مع العميل</option>
              <option value="completed">مكتمل وتم التسليم</option>
            </select>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Purchased Items Card */}
          <div className="md:col-span-8 bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
              المنتجات المطلوبة ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-neutral-100 dark:divide-zinc-800">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-zinc-700">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-zinc-800 font-mono">
                            مقاس: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-zinc-800 font-mono">
                            لون: {item.selectedColor}
                          </span>
                        )}
                        <span>·</span>
                        <span className="font-mono">الكمية: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-mono font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                    {(item.price * item.quantity).toLocaleString("ar-SA", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-[10px] font-sans font-normal text-neutral-400">
                      {currency}
                    </span>
                  </p>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="pt-4 border-t border-neutral-200/80 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span>المجموع الفرعي</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">
                  {(order.subtotal || order.total).toLocaleString("ar-SA", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-[10px] font-sans font-normal text-neutral-400">{currency}</span>
                </span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span>الخصم المطبق</span>
                    {order.couponCode && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 font-mono text-[10px] border border-emerald-300 dark:border-emerald-800">
                        {order.couponCode}
                      </span>
                    )}
                  </span>
                  <span className="font-mono">
                    -{Number(order.discountAmount).toLocaleString("ar-SA", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{" "}
                    <span className="text-[10px] font-sans font-normal text-emerald-600/80">{currency}</span>
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-neutral-500">
                <span>رسوم الشحن</span>
                <span className="font-mono">
                  {order.shippingAmount && Number(order.shippingAmount) > 0
                    ? `${Number(order.shippingAmount).toLocaleString("ar-SA")} ${currency}`
                    : "مجاني"}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-white">إجمالي قيمة الطلب</span>
                <span className="text-base font-black font-mono text-neutral-900 dark:text-white">
                  {order.total.toLocaleString("ar-SA", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  <span className="text-xs font-sans font-normal text-neutral-400">{currency}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details & Actions */}
          <div className="md:col-span-4 space-y-4">
            {/* Customer Contact Card */}
            <div className="bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                بيانات العميل والتوصيل
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 text-[11px] block">اسم العميل</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {order.customerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 text-[11px] block">رقم الهاتف</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white dir-ltr block text-right">
                      {order.customerPhone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 text-[11px] block">عنوان التوصيل</span>
                    <span className="text-neutral-700 dark:text-zinc-300 leading-relaxed">
                      {order.customerAddress || "لم يتم تحديد عنوان تفصيلي"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Contact Actions */}
              <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل عبر واتساب</span>
                </a>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="w-full py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال هاتفي</span>
                </a>
              </div>
            </div>

            {/* Merchant Note */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-200/60 dark:border-zinc-800 text-[11px] text-neutral-500 leading-relaxed space-y-1">
              <p className="font-bold text-neutral-700 dark:text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>إجراءات استكمال الطلب</span>
              </p>
              <p>
                يُنصح بالتواصل مع العميل عبر واتساب لتأكيد موعد التوصيل وطريقة الدفع قبل تغيير الحالة إلى "مكتمل".
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
