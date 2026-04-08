import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats, useListDashboardOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, DollarSign, Activity } from "lucide-react";

export default function Overview() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: orders, isLoading: ordersLoading } = useListDashboardOrders();

  if (statsLoading || ordersLoading) return <DashboardLayout><div className="py-10 text-center">Loading dashboard...</div></DashboardLayout>;

  const statCards = [
    { title: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart },
    { title: "New Orders", value: stats?.newOrders || 0, icon: Activity },
    { title: "Total Products", value: stats?.totalProducts || 0, icon: Package },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {(!orders || orders.length === 0) && (
                  <p className="text-muted-foreground text-center py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}