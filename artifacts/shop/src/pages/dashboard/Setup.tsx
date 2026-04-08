import { useState } from "react";
import { useLocation } from "wouter";
import { 
  useInitDashboardStore,
  getGetDashboardStoreQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";

export default function Setup() {
  const [, setLocation] = useLocation();
  const initStore = useInitDashboardStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    whatsappNumber: "",
    primaryColor: "#000000"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    initStore.mutate({ data: form }, {
      onSuccess: () => {
        toast({ title: "Store created successfully!" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Failed to create store", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-lg border space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create Your Store</h1>
          <p className="text-muted-foreground text-sm">Set up your marketplace presence in seconds.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="My Awesome Store" />
          </div>

          <div className="space-y-2">
            <Label>Store URL Slug</Label>
            <Input required value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="my-awesome-store" />
            <p className="text-[10px] text-muted-foreground">This will be your store link: /store/<b>{form.slug || 'slug'}</b></p>
          </div>

          <div className="space-y-2">
            <Label>WhatsApp Number</Label>
            <Input required value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="+1234567890" />
          </div>

          <div className="space-y-2 pb-4">
            <Label>Brand Color (Hex)</Label>
            <div className="flex gap-4">
              <Input type="color" className="w-16 h-10 p-1" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} />
              <Input value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={initStore.isPending}>
            {initStore.isPending ? "Creating..." : "Complete Setup"}
          </Button>
        </form>
      </div>
    </div>
  );
}