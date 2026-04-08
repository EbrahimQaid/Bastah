import { useRoute } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useListStoreProducts, useListStoreCategories } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [, params] = useRoute("/store/:storeSlug");
  const storeSlug = params?.storeSlug || "demo-store";

  const { data: products } = useListStoreProducts(storeSlug);
  const { data: categories } = useListStoreCategories(storeSlug);

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="flex flex-col gap-6">
        {/* Banner */}
        <div className="h-48 bg-muted relative w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5"></div>
          <h1 className="text-3xl font-serif font-bold z-10">Welcome</h1>
        </div>

        {/* Categories */}
        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Shop by Category</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories?.map(cat => (
              <Link key={cat.id} href={`/store/${storeSlug}/products?categoryId=${cat.id}`}>
                <div className="px-4 py-2 bg-secondary rounded-full text-sm whitespace-nowrap cursor-pointer hover:bg-secondary/80">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Featured</h2>
            <Link href={`/store/${storeSlug}/products`} className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {products?.filter(p => p.featured).slice(0, 4).map(product => (
              <Link key={product.id} href={`/store/${storeSlug}/products/${product.id}`}>
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden group">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">${product.price.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}