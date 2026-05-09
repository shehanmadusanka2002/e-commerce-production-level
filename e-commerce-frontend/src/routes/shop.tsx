import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ProductCard } from "@/components/site/ProductCard";
import { BRANDS, type Category, type Product } from "@/lib/products";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Star, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/services/api";

const searchSchema = z.object({ 
  category: z.string().optional(),
  search: z.string().optional()
});

export const Route = createFileRoute("/shop")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Shop — Atelier" }, { name: "description", content: "Browse the full collection." }] }),
  component: ShopPage,
});

function ShopPage() {
  const { category: initialCat, search: initialSearch } = Route.useSearch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(initialSearch);
  const [availableBrands, setAvailableBrands] = useState<{ id: string; name: string }[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([0, 10000]); // Increased max price
  const [minRating, setMinRating] = useState(0);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
 
  // Fetch Initial Data
  useEffect(() => {
    api.getCategories().then(data => {
      setCategories(data);
      if (initialCat) {
        const found = data.find(c => c.name === initialCat || c.id === initialCat);
        if (found) setCategoryId(found.id);
      }
    });
    api.getBrands().then(setAvailableBrands);
  }, [initialCat]);

  // Update search when URL search changes
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Fetch Products
  useEffect(() => {
    setLoading(true);
    api.getProducts({
      category: categoryId,
      minPrice: price[0],
      maxPrice: price[1],
      search: searchQuery,
    }).then(data => {
      const filtered = data.filter(p => 
        (selectedBrands.length === 0 || selectedBrands.includes(p.brand)) &&
        p.rating >= minRating
      );
      setProducts(filtered);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [categoryId, price, selectedBrands, minRating, searchQuery]);

  const Filters = (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Category</h4>
        <div className="space-y-2">
          <button 
            onClick={() => setCategoryId(undefined)} 
            className={`block text-sm transition-smooth ${!categoryId ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button 
              key={c.id} 
              onClick={() => setCategoryId(c.id)} 
              className={`block text-sm transition-smooth ${categoryId === c.id ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Price</h4>
        <Slider min={0} max={1000} step={10} value={price} onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])} />
        <div className="mt-4 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>RS. {price[0]}</span>
          <span>RS. {price[1]}</span>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Brand</h4>
        <div className="space-y-2">
          {availableBrands.map((b) => (
            <Label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm font-normal text-muted-foreground hover:text-foreground transition-smooth">
              <Checkbox
                checked={selectedBrands.includes(b.name)}
                onCheckedChange={(c) => setSelectedBrands((s) => (c ? [...s, b.name] : s.filter((x) => x !== b.name)))}
                className="rounded-none"
              />
              {b.name}
            </Label>
          ))}
          {availableBrands.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No brands available</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider">Rating</h4>
        <div className="space-y-1">
          {[4, 3, 2, 0].map((r) => (
            <button 
              key={r} 
              onClick={() => setMinRating(r)} 
              className={`flex items-center gap-2 text-sm transition-smooth ${minRating === r ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r === 0 ? "Any Rating" : (
                <><div className="flex"><Star className="h-3 w-3 fill-current text-foreground" /></div><span>{r}+ Stars</span></>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-end justify-between border-b border-border pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Collection</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {searchQuery ? `Search: ${searchQuery}` : (categories.find(c => c.id === categoryId)?.name ?? "All Collection")}
          </h1>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{loading ? "Updating..." : `${products.length} Items`}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block border-r border-border pr-8">{Filters}</aside>

        <div className="lg:hidden mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-none"><SlidersHorizontal className="h-4 w-4" /> Filters</Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto p-6">
              <SheetHeader><SheetTitle>Refine Selection</SheetTitle></SheetHeader>
              <div className="mt-8">{Filters}</div>
            </SheetContent>
          </Sheet>
        </div>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
               {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-square animate-pulse bg-secondary/20 rounded-none" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-none border border-dashed border-border py-24 text-center text-sm text-muted-foreground">
              No products match your current filters. Try adjusting your selection.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
