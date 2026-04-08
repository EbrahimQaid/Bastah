import { useRoute } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // Assuming we will create or just use simple state

export default function ProductList() {
  const [, params] = useRoute("/store/:storeSlug/products");
  const storeSlug = params?.storeSlug || "demo-store";
  const [search, setSearch] = useState("");
  
  // We should debounce this in a real app
  const { data: products, isLoading } = useListStoreProducts(storeSlug, { params: { search: search || undefined } });

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="p-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-muted/50 border-none rounded-full" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{products?.length || 0} Products</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {products?.map(product => (
                <Link key={product.id} href={`/store/${storeSlug}/products/${product.id}`}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group h-full flex flex-col">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                      )}
                    </div>
                    <CardContent className="p-3 flex-1 flex flex-col">
                      <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                      <div className="mt-auto pt-2">
                        <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </StoreLayout>
  );
}