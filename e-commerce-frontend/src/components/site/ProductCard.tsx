import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Heart } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
    const add = useCart((s) => s.add);
    const { toggle, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const nav = useNavigate();
    const isFav = isInWishlist(product.id);
    const [isAdded, setIsAdded] = useState(false);
  
    const handleWishlist = async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!user) {
        toast.error("Please login to save favorites");
        nav({ to: "/login" });
        return;
      }
      try {
        await toggle(product);
      } catch (err) {
        toast.error("Could not update wishlist");
      }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
      e.stopPropagation();
      add(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    };
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
        className="group relative"
      >
        <div className="relative aspect-square overflow-hidden rounded-none bg-secondary/40">
          <Link to="/product/$id" params={{ id: product.id }} className="block h-full w-full">
            <motion.img
              src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop'}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=400&auto=format&fit=crop';
              }}
            />
          </Link>
  
          {/* Wishlist Toggle */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={handleWishlist}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center bg-background/80 text-foreground transition-smooth hover:bg-background hover:scale-110 shadow-sm"
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
          </motion.button>
  
          <div className="absolute inset-x-3 bottom-3 transition-all duration-300 ease-out md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddToCart}
                className={cn(
                  "w-full gap-2 shadow-lg transition-all duration-300 border-none h-11 rounded-none font-bold uppercase tracking-widest text-[10px]",
                  isAdded ? "bg-green-600 text-white hover:bg-green-700" : "bg-black text-white hover:bg-black/80"
                )}
                size="sm"
              >
                {isAdded ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-current" /> Added!
                  </motion.div>
                ) : (
                  <><Plus className="h-4 w-4" /> Add to Cart</>
                )}
              </Button>
            </motion.div>
          </div>
        </div>

      <div className="mt-4 flex items-start justify-between gap-2">
        <Link to="/product/$id" params={{ id: product.id }} className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.brand}</p>
          <h3 className="mt-1 truncate text-sm font-medium transition-smooth hover:text-primary">{product.name}</h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-current text-foreground" />
              <span className="font-medium text-foreground">{product.rating}</span>
            </div>
          </div>
        </Link>
        <div className="text-sm font-semibold">RS. {product.price}</div>
      </div>
    </motion.div>
  );
}
