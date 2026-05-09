import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { api } from "@/services/api";
import { reviewsApi, type Review } from "@/services/reviews";
import { type Product } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { ChevronLeft, Star, ShoppingBag, Truck, ShieldCheck, RotateCcw, MessageSquare, Send, Plus, Heart } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/product/$id")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { id } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState<{ rating: number; comment: string; images: string[] }>({ 
    rating: 5, 
    comment: "", 
    images: [] 
  });
  
  const { add } = useCart();
  const { user } = useAuth();
  const { toggle, isInWishlist } = useWishlist();
  const nav = useNavigate();
  const isFav = product ? isInWishlist(product.id) : false;

  const handleWishlist = async () => {
    if (!user) {
      toast.error("Please login to save favorites");
      nav({ to: "/login" });
      return;
    }
    if (!product) return;
    try {
      await toggle(product);
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  const fetchReviews = () => {
    reviewsApi.fetchByProduct(id).then(setReviews).catch(() => setReviews([]));
  };

  useEffect(() => {
    Promise.all([
      api.getProductById(id).catch(() => null),
      reviewsApi.fetchByProduct(id).catch(() => [])
    ]).then(([p, r]) => {
      if (!p) {
        toast.error("Product not found");
      } else {
        setProduct(p);
      }
      setReviews(r || []);
    })
    .finally(() => setLoading(false));
  }, [id]);

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (newReview.images.length >= 3) return toast.error("Max 3 images allowed");
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewReview(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to leave a review");
    if (!newReview.comment.trim()) return toast.error("Please add a comment");

    setSubmitting(true);
    try {
      await reviewsApi.create({
        productId: id,
        rating: newReview.rating,
        comment: newReview.comment,
        images: newReview.images
      });
      toast.success("Review submitted!");
      setNewReview({ rating: 5, comment: "", images: [] });
      fetchReviews();
      api.getProductById(id).then(setProduct);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 animate-pulse">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-secondary/20" />
          <div className="space-y-6">
            <div className="h-8 w-1/2 bg-secondary/20 rounded" />
            <div className="h-4 w-1/4 bg-secondary/20 rounded" />
            <div className="h-24 bg-secondary/20 rounded" />
            <div className="h-12 w-full bg-secondary/20 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <Link to="/shop"><Button>Back to Shop</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
        <ChevronLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-none bg-secondary/30 aspect-square">
            <img 
              src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop'} 
              alt={product.name} 
              className="h-full w-full object-cover transition-smooth hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=800&auto=format&fit=crop';
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-none bg-secondary/30">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              {product.brand} • {product.categoryName || 'Product'}
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">{product.name}</h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`} 
                  />
                ))}
                <span className="ml-2 text-sm font-medium">{product.rating}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground uppercase tracking-widest">{(reviews || []).length} Reviews</span>
            </div>
          </div>

          <div className="mb-8">
            <span className="text-3xl font-medium">RS. {product.price}</span>
          </div>

          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <div className="mb-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="flex-1 gap-2 h-14 text-lg rounded-none" onClick={() => add(product)}>
              <ShoppingBag className="h-5 w-5" /> Add to bag
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className={`h-14 px-8 rounded-none gap-2 transition-smooth ${isFav ? 'border-red-500/50 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700' : ''}`}
              onClick={handleWishlist}
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? "Saved" : "Wishlist"}
            </Button>
          </div>

          <div className="grid gap-6 border-t border-border pt-10 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <Truck className="mb-2 h-5 w-5 text-muted-foreground" />
              <h4 className="text-sm font-medium">Fast Shipping</h4>
              <p className="text-xs text-muted-foreground">Delivery in 2-4 days</p>
            </div>
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <ShieldCheck className="mb-2 h-5 w-5 text-muted-foreground" />
              <h4 className="text-sm font-medium">Warranty</h4>
              <p className="text-xs text-muted-foreground">1 year coverage</p>
            </div>
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <RotateCcw className="mb-2 h-5 w-5 text-muted-foreground" />
              <h4 className="text-sm font-medium">Easy Returns</h4>
              <p className="text-xs text-muted-foreground">30-day window</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 border-t border-border pt-16">
        <div className="grid gap-16 lg:grid-cols-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Customer Reviews</h2>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-5xl font-bold">{product.rating}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <span className="mt-1 text-sm text-muted-foreground">Based on {(reviews || []).length} reviews</span>
              </div>
            </div>

            {user ? (
              <form onSubmit={submitReview} className="mt-10 space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-widest">Write a review</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="transition-smooth hover:scale-110"
                    >
                      <Star className={`h-6 w-6 ${star <= newReview.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground opacity-40'}`} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Share your thoughts about this product..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="min-h-[120px] rounded-none bg-secondary/20 border-none focus-visible:ring-1 focus-visible:ring-foreground"
                />

                {/* Review Images Upload */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {newReview.images?.map((img, i) => (
                      <div key={i} className="group relative h-16 w-16 overflow-hidden border border-border">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setNewReview(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <span className="text-[10px] font-bold text-white uppercase">Remove</span>
                        </button>
                      </div>
                    ))}
                    {(newReview.images?.length || 0) < 3 && (
                      <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-secondary/10 transition-colors hover:bg-secondary/20">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageAdd} />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Add up to 3 photos</p>
                </div>

                <Button disabled={submitting} className="w-full rounded-none h-12 gap-2 uppercase tracking-widest text-xs">
                  {submitting ? "Submitting..." : <>Submit Review <Send className="h-3 w-3" /></>}
                </Button>
              </form>
            ) : (
              <div className="mt-10 bg-secondary/20 p-6 text-center">
                <p className="text-sm text-muted-foreground">Please login to share your experience.</p>
                <Link to="/login"><Button variant="link" className="mt-2">Login Now</Button></Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-10">
              {(!reviews || reviews.length === 0) ? (
                <div className="flex h-40 flex-col items-center justify-center border border-dashed border-border text-muted-foreground">
                  <MessageSquare className="mb-2 h-6 w-6 opacity-20" />
                  <p className="text-sm">No reviews yet. Be the first to rate this product!</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="group animate-fade-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center bg-secondary font-medium uppercase">
                          {r.user.fullName?.[0] || r.user.email[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold uppercase tracking-wider">{r.user.fullName || r.user.email.split('@')[0]}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'fill-foreground text-foreground' : 'text-muted-foreground opacity-20'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-smooth">
                      {r.comment}
                    </p>
                    {r.images && r.images.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {r.images.map((img, idx) => (
                          <div key={idx} className="h-20 w-20 overflow-hidden bg-secondary/20 border border-border/50">
                            <img src={img} alt="" className="h-full w-full object-cover transition-smooth hover:scale-110" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
