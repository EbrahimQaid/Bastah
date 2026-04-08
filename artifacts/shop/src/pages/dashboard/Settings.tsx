import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { 
  useGetDashboardStore, 
  useUpdateDashboardStore,
  getGetDashboardStoreQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export default function Settings() {
  const { data: store, isLoading } = useGetDashboardStore();
  const updateStore = useUpdateDashboardStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    whatsappNumber: "",
    primaryColor: "#000000",
    coverImage: "",
    logoImage: ""
  });

  useEffect(() => {
    if (store) {
      setForm({
        name: store.name,
        description: store.description || "",
        whatsappNumber: store.whatsappNumber,
        primaryColor: store.primaryColor || "#000000",
        coverImage: store.coverImage || "",
        logoImage: store.logoImage || ""
      });
    }
  }, [store]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStore.mutate({ data: form }, {
      onSuccess: () => {
        toast({ title: "Store settings updated" });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStoreQueryKey() });
      }
    });
  };

  const copyStoreLink = () => {
    if (!store) return;
    const url = `${window.location.origin}/store/${store.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Store link copied to clipboard" });
  };

  if (isLoading) return <DashboardLayout><div className="py-10 text-center">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
          <Button variant="outline" onClick={copyStoreLink} className="gap-2">
            <Copy className="w-4 h-4" /> Copy Store Link
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border rounded-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input required value={form.whatsappNumber} onChange={e => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="+1234567890" />
            </div>

            <div className="space-y-2">
              <Label>Primary Color (Hex)</Label>
              <div className="flex gap-4">
                <Input type="color" className="w-16 h-10 p-1" value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} />
                <Input value={form.primaryColor} onChange={e => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} />
            </div>
            
            <div className="space-y-2">
              <Label>Logo Image URL</Label>
              <Input value={form.logoImage} onChange={e => setForm({ ...form, logoImage: e.target.value })} />
            </div>
          </div>

          <Button type="submit" disabled={updateStore.isPending}>Save Changes</Button>
        </form>
      </div>
    </DashboardLayout>
  );
}