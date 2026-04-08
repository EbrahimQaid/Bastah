import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { 
  useCreateDashboardProduct, 
  useUpdateDashboardProduct, 
  useListDashboardProducts,
  getListDashboardProductsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ProductForm() {
  const [match, params] = useRoute("/dashboard/products/:productId/edit");
  const isEdit = !!match;
  const productId = parseInt(params?.productId || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products } = useListDashboardProducts({ query: { enabled: isEdit } });
  const product = products?.find(p => p.id === productId);

  const createProduct = useCreateDashboardProduct();
  const updateProduct = useUpdateDashboardProduct();

  const [form, setForm] = useState({
    name: "",
    price: 0,
    description: "",
    images: "",
    sizes: "",
    colors: "",
    inStock: true,
    featured: false
  });

  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name,
        price: product.price,
        description: product.description || "",
        images: product.images.join(", "),
        sizes: product.variants?.sizes?.join(", ") || "",
        colors: product.variants?.colors?.join(", ") || "",
        inStock: product.inStock,
        featured: product.featured
      });
    }
  }, [isEdit, product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      images: form.images.split(",").map(s => s.trim()).filter(Boolean),
      variants: {
        sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map(s => s.trim()).filter(Boolean),
      },
      inStock: form.inStock,
      featured: form.featured
    };

    if (isEdit) {
      updateProduct.mutate({ productId, data }, {
        onSuccess: () => {
          toast({ title: "Product updated successfully" });
          queryClient.invalidateQueries({ queryKey: getListDashboardProductsQueryKey() });
          setLocation("/dashboard/products");
        }
      });
    } else {
      createProduct.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Product created successfully" });
          queryClient.invalidateQueries({ queryKey: getListDashboardProductsQueryKey() });
          setLocation("/dashboard/products");
        }
      });
    }
  };

  if (isEdit && !product && products) {
    return <DashboardLayout><div className="py-10 text-center">Product not found</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit Product" : "Add Product"}</h1>
          <Link href="/dashboard/products">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border rounded-lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Image URLs (comma separated)</Label>
              <Input value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Sizes (comma separated)</Label>
              <Input value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L" />
            </div>

            <div className="space-y-2">
              <Label>Colors (comma separated hex codes/names)</Label>
              <Input value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="#000000, #ffffff" />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="in-stock" checked={form.inStock} onCheckedChange={c => setForm({ ...form, inStock: c })} />
                <Label htmlFor="in-stock">In Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="featured" checked={form.featured} onCheckedChange={c => setForm({ ...form, featured: c })} />
                <Label htmlFor="featured">Featured</Label>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}