import { useRoute } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStoreProduct } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/store/:storeSlug/products/:productId");
  const storeSlug = params?.storeSlug || "demo-store";
  const productId = parseInt(params?.productId || "0", 10);
  
  const { data: product, isLoading } = useGetStoreProduct(storeSlug, productId);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  if (isLoading) return <StoreLayout storeSlug={storeSlug}><div className="p-10 text-center">Loading...</div></StoreLayout>;
  if (!product) return <StoreLayout storeSlug={storeSlug}><div className="p-10 text-center">Product not found</div></StoreLayout>;

  const handleAddToCart = () => {
    if (product.variants?.sizes?.length && !selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    if (product.variants?.colors?.length && !selectedColor) {
      toast({ title: "Please select a color", variant: "destructive" });
      return;
    }
    
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      selectedSize,
      selectedColor
    });
    
    toast({ title: "Added to cart", description: `${product.name} added to your cart.` });
  };

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="bg-background min-h-screen pb-24">
        {/* Images */}
        <div className="aspect-square bg-muted w-full relative">
          {product.images[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
          )}
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-xl font-medium mt-2">${product.price.toFixed(2)}</p>
          </div>
          
          <p className="text-muted-foreground">{product.description}</p>
          
          {product.variants?.sizes && product.variants.sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.variants.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      selectedSize === size ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {product.variants?.colors && product.variants.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Color</h3>
              <div className="flex gap-2 flex-wrap">
                {product.variants.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full h-12 text-lg mt-8" 
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}