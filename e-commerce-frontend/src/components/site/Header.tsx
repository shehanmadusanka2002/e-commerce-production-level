import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, User, Menu, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { useState } from "react";
import { SearchOverlay } from "./SearchOverlay";

export function Header() {
  const { count, open } = useCart();
  const { user, signOut, role } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const itemCount = count();

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
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <SearchOverlay 
            isOpen={isSearchOpen} 
            onClose={() => setIsSearchOpen(false)} 
          />
          
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
