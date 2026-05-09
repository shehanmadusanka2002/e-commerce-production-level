import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
  head: () => ({ meta: [{ title: "My Wishlist — Atelier" }] }),
});

function WishlistPage() {
  const { items, fetch, isLoading } = useWishlist();

  useEffect(() => {
    fetch();
  }, []);

  if (isLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-8 w-48 bg-muted" />
          <div className="mx-auto h-4 w-64 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-4 border-b border-border pb-8 sm:flex-row">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} saved for later.
          </p>
        </div>
        <Link to="/shop">
          <Button variant="outline" className="rounded-none">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-none bg-secondary/50">
            <Heart className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h2 className="mt-6 text-xl font-medium">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Save items you love to your wishlist and they'll appear here.
          </p>
          <Link to="/shop" className="mt-8">
            <Button size="lg" className="rounded-none px-10">
              Explore Shop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
