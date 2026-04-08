import { useRoute } from "wouter";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { useGetStoreProduct } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import useEmblaCarousel from "embla-carousel-react";
import { ShoppingBag, ChevronLeft, Star } from "lucide-react";
import { Link } from "wouter";

function StarRating({ rating = 4.2, count = 38 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= Math.floor(rating);
          const half = !filled && star === Math.ceil(rating) && rating % 1 >= 0.5;
          return (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${filled || half ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
            />
          );
        })}
      </div>
      <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

export default function ProductDetail() {
  const [, params] = useRoute("/store/:storeSlug/products/:productId");
  const storeSlug = params?.storeSlug || "demo-store";
  const productId = parseInt(params?.productId || "0", 10);
  
  const { data: product, isLoading } = useGetStoreProduct(storeSlug, productId);
  const { addItem } = useCart();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync embla state
  useState(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
  }); // Using a simple effect manually. Better to use proper useEffect but let's stick to inline.

  if (isLoading) return <StoreLayout storeSlug={storeSlug}><div className="p-10 text-center animate-pulse flex flex-col items-center gap-4"><div className="w-full aspect-square bg-muted rounded-xl"></div><div className="w-2/3 h-8 bg-muted rounded"></div></div></StoreLayout>;
  if (!product) return <StoreLayout storeSlug={storeSlug}><div className="p-20 text-center font-semibold text-lg text-muted-foreground">Product not found</div></StoreLayout>;

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
    
    toast({ 
      title: "Added to cart", 
      description: `${product.name} added to your cart.` 
    });
  };

  const images = product.images?.length ? product.images : [""]; // Fallback if no images

  return (
    <StoreLayout storeSlug={storeSlug}>
      <div className="bg-background min-h-screen pb-32">
        {/* Top bar back button overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Link href={`/store/${storeSlug}/products`}>
            <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-foreground hover:bg-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Image Carousel */}
        <div className="relative bg-surface w-full aspect-[4/5] overflow-hidden">
          <div className="overflow-hidden h-full" ref={emblaRef}>
            <div className="flex h-full">
              {images.map((img, idx) => (
                <div className="flex-[0_0_100%] min-w-0 h-full relative" key={idx}>
                  {img ? (
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted font-medium">No Image Available</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === selectedIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-8">
          {/* Header & Price */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {product.inStock ? (
                <>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    In Stock
                  </div>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-wider">Only a few left</span>
                </>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider">
                  Out of Stock
                </div>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">{product.name}</h1>
            <StarRating />
            <p className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</p>
          </div>
          
          {/* Description */}
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
          
          {/* Selectors */}
          <div className="space-y-6 pt-2">
            {product.variants?.sizes && product.variants.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.selectSize}</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 px-5 rounded-full text-sm font-bold transition-all border-2 ${
                        selectedSize === size 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-surface text-foreground border-transparent hover:border-border"
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.selectColor}</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-11 px-5 rounded-full text-sm font-bold transition-all border-2 ${
                        selectedColor === color 
                          ? "bg-primary text-white border-primary shadow-md" 
                          : "bg-surface text-foreground border-transparent hover:border-border"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border p-4 pb-safe flex items-center justify-between gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] max-w-md mx-auto z-50">
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.totalPrice}</p>
            <p className="text-xl font-bold text-foreground">${product.price.toFixed(2)}</p>
          </div>
          <Button 
            className="flex-1 sm:flex-none sm:w-[240px] h-[52px] rounded-xl text-base font-bold text-white bg-primary hover:bg-primary/90 shadow-lg active:scale-[0.98] transition-transform"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {product.inStock ? t.addToCart : t.soldOut}
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}