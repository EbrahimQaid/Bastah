import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRoute, Link } from "wouter";
import { 
  useGetDashboardOrder, 
  useUpdateDashboardOrderStatus,
  getGetDashboardOrderQueryKey,
  getListDashboardOrdersQueryKey,
  UpdateOrderStatusBodyStatus
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function OrderDetail() {
  const [, params] = useRoute("/dashboard/orders/:orderId");
  const orderId = parseInt(params?.orderId || "0", 10);
  const { data: order, isLoading } = useGetDashboardOrder(orderId, { query: { enabled: !!orderId } });
  const updateStatus = useUpdateDashboardOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (status: UpdateOrderStatusBodyStatus) => {
    updateStatus.mutate({ orderId, data: { status } }, {
      onSuccess: () => {
        toast({ title: "Status updated" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardOrderQueryKey(orderId) });
        queryClient.invalidateQueries({ queryKey: getListDashboardOrdersQueryKey() });
      }
    });
  };

  if (isLoading) return <DashboardLayout><div className="py-10 text-center">Loading...</div></DashboardLayout>;
  if (!order) return <DashboardLayout><div className="py-10 text-center">Order not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Order #{order.id}</h1>
          <span className={`ml-auto text-xs px-3 py-1 rounded-full ${
            order.status === 'new' ? 'bg-blue-100 text-blue-800' :
            order.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {order.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Customer Details</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Name:</span> {order.customerName}</p>
              <p><span className="text-muted-foreground">Phone:</span> {order.customerPhone}</p>
              <p><span className="text-muted-foreground">Address:</span> {order.customerAddress}</p>
              {order.notes && <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>}
            </div>

            <div className="pt-4 border-t space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={order.status} onValueChange={(val) => handleStatusChange(val as UpdateOrderStatusBodyStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <a 
                href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(order.whatsappMessage)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-2 px-4 rounded-md font-medium hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Open in WhatsApp
              </a>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} 
                      {item.selectedSize && ` • Size: ${item.selectedSize}`}
                      {item.selectedColor && ` • Color: ${item.selectedColor}`}
                    </p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}