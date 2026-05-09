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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white"
        >
          <div className="flex h-20 items-center justify-between px-6 lg:px-12">
            <div className="text-xl font-semibold tracking-tight">
              ATELIER<span className="text-muted-foreground">.</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-smooth hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mx-auto w-full max-w-4xl px-4 pt-12">
            <div className="relative flex items-center border-b border-white/20 pb-4 focus-within:border-white transition-smooth">
              <Search className="h-8 w-8 text-white/50" />
              <input
                autoFocus
                type="text"
                placeholder="Search our collection..."
                className="w-full bg-transparent px-6 text-4xl font-light text-white outline-none placeholder:text-white/20"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="mt-16 overflow-y-auto pb-20 max-h-[calc(100vh-300px)] custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                      Product Matches
                    </h3>
                    <Link
                      to="/shop"
                      search={{ search: query } as never}
                      onClick={onClose}
                      className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"
                    >
                      View all results
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        to="/products/$id"
                        params={{ id: product.id }}
                        onClick={onClose}
                        className="group flex items-center gap-6 border border-white/5 bg-white/5 p-4 transition-smooth hover:border-white/20 hover:bg-white/10"
                      >
                        <div className="h-24 w-24 flex-none overflow-hidden bg-black">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover opacity-80 transition-smooth group-hover:opacity-100 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-[10px] uppercase tracking-widest text-white/40">{product.brand}</p>
                          <h4 className="mt-1 truncate text-base font-medium">{product.name}</h4>
                          <p className="mt-2 text-sm font-semibold text-emerald-400">
                            RS. {product.price.toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : query.length >= 2 ? (
                <div className="py-20 text-center">
                  <p className="text-xl font-light text-white/40">No results found for "<span className="text-white">{query}</span>"</p>
                </div>
              ) : (
                <div className="grid gap-16 md:grid-cols-2">
                  <div>
                    <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                      Top Categories
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {["Electronics", "Fashion", "Home & Gadgets", "Living"].map((cat) => (
                        <Link
                          key={cat}
                          to="/shop"
                          search={{ category: cat } as never}
                          onClick={onClose}
                          className="border border-white/10 px-4 py-3 text-sm font-medium transition-smooth hover:border-white hover:bg-white text-white hover:text-black text-center"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
                      Popular Searches
                    </h3>
                    <div className="space-y-4">
                      {["Smartwatch", "Headphones", "Sneakers", "Furniture"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="block text-xl font-light text-white/60 transition-smooth hover:text-white"
                        >
                          {s}
                        </button>
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
