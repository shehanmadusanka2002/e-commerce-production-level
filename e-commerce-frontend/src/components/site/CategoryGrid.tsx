import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { api } from "@/services/api";
import { type Category, type Product } from "@/lib/products";
import { ArrowUpRight } from "lucide-react";

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories);
    api.getProducts().then(setProducts);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-end justify-between border-b border-border pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Browse</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Shop by Category</h2>
        </div>
        <Link to="/shop" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth sm:inline-flex">
          Browse All Collections →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {categories.map((c, idx) => {
          const fallbackImages: Record<string, string> = {
            "Electronics": "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=600&auto=format&fit=crop",
            "Fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop",
            "Home & Gadgets": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop",
            "Living": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop"
          };

          const productWithImage = products.find((p) => p.categoryId === c.id);
          const cover = productWithImage?.images?.[0] || fallbackImages[c.name] || fallbackImages["Electronics"];

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
            >
              <Link 
                to="/shop" 
                search={{ category: c.id } as never} 
                className="group relative block aspect-[4/5] overflow-hidden rounded-none bg-secondary"
              >
                <img 
                  src={cover} 
                  alt={c.name} 
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110" 
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImages[c.name] || fallbackImages["Electronics"];
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-x-8 bottom-8 text-white">
                  <p className="text-xs uppercase tracking-[0.25em] opacity-70">{c.description || "Collection"}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <h3 className="text-3xl font-semibold tracking-tight">{c.name}</h3>
                    <div className="flex h-10 w-10 items-center justify-center border border-white/20 transition-all duration-300 group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
