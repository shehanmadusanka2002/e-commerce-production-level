import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, User, Menu, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const { count, open } = useCart();
  const { user, signOut, role } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemCount = count();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { search: searchQuery.trim() } as any });
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            ATELIER<span className="text-muted-foreground">.</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/" className="text-muted-foreground transition-smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>Home</Link>
            <Link to="/shop" className="text-muted-foreground transition-smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>Shop</Link>
            <Link to="/shop" search={{ category: "Electronics" } as never} className="text-muted-foreground transition-smooth hover:text-foreground">Electronics</Link>
            <Link to="/shop" search={{ category: "Fashion" } as never} className="text-muted-foreground transition-smooth hover:text-foreground">Fashion</Link>
            <Link to="/shop" search={{ category: "Home & Gadgets" } as never} className="text-muted-foreground transition-smooth hover:text-foreground">Living</Link>
            {user && (
              <Link to="/orders" className="text-muted-foreground transition-smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>My Orders</Link>
            )}
            {role === "ADMIN" && (
              <Link to="/admin" className="text-foreground font-medium transition-smooth hover:opacity-80">Admin Dashboard</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.form
                key="search-input"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="relative flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-9 w-full rounded-none border border-foreground/20 bg-background px-9 text-sm outline-none focus:border-foreground"
                  onBlur={() => !searchQuery && setIsSearchOpen(false)}
                />
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Close</span>
                  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                    <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="search-button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Search"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {user ? (
            <div className="flex items-center gap-2 pl-2">
              <span className="hidden text-sm font-medium lg:block">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" aria-label="Account">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          <Link to="/wishlist">
            <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
              <Heart className="h-5 w-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-medium text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Button>
          </Link>

          <Button variant="ghost" size="icon" aria-label="Cart" onClick={open} className="relative ml-1">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                {itemCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></Button>
        </div>
      </div>
    </header>
  );
}
