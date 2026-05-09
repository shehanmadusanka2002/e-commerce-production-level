import { useState, useEffect } from "react";
import { Search, X, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { Product } from "@/lib/products";

type SearchOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await api.getProducts({ search: query });
        setResults(data.slice(0, 5)); // Show top 5 results
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          <div className="mx-auto w-full max-w-3xl px-4 pt-20">
            <div className="relative flex items-center border-b-2 border-foreground/20 py-4 focus-within:border-foreground transition-smooth">
              <Search className="h-6 w-6 text-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                className="w-full bg-transparent px-4 text-3xl font-normal text-foreground outline-none placeholder:text-muted-foreground/30"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                onClick={onClose}
                className="ml-4 rounded-full p-2 transition-smooth hover:bg-secondary text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-12">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Products
                    </h3>
                    <Link
                      to="/shop"
                      search={{ search: query } as never}
                      onClick={onClose}
                      className="group flex items-center gap-2 text-sm font-medium"
                    >
                      View all results
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="grid gap-6">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to="/products/$id"
                        params={{ id: product.id }}
                        onClick={onClose}
                        className="group flex items-center gap-4 rounded-none border border-transparent p-2 transition-smooth hover:border-border hover:bg-secondary/30"
                      >
                        <div className="h-16 w-16 flex-none overflow-hidden bg-secondary/50">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="truncate text-sm font-medium">{product.name}</h4>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                        <div className="text-sm font-semibold">
                          RS. {product.price.toLocaleString()}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : query.length >= 2 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground">No products found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Popular Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["Electronics", "Fashion", "Home & Gadgets", "Living"].map((cat) => (
                        <Link
                          key={cat}
                          to="/shop"
                          search={{ category: cat } as never}
                          onClick={onClose}
                        >
                          <Button variant="outline" size="sm" className="rounded-none">
                            {cat}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
