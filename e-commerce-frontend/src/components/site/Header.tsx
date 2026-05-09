import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Search, User, Menu, LogOut, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { useWishlist } from "@/store/wishlist";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function Header() {
  const { count, open } = useCart();
  const { user, signOut, role } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const itemCount = count();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: "/shop", search: { search: searchQuery.trim() } as any });
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate({ to: "/shop", search: { search: mobileSearch.trim() } as any });
      setMobileSearch("");
    }
  };

  const handleMobileInlineSearch = (e: React.FormEvent) => {
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
          {/* ── Desktop Search ── */}
          <AnimatePresence mode="wait">
            {isSearchOpen ? (
              <motion.form
                key="search-open"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleDesktopSearch}
                className="hidden md:flex items-center gap-2"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="h-9 w-52 rounded-none border border-foreground/20 bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 rounded-none px-4 text-[10px] uppercase tracking-widest font-bold"
                >
                  Search
                </Button>
                <button
                  type="button"
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="search-closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden md:block"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open search"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mobile: search icon toggles inline bar below header ── */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="md:hidden"
            onClick={() => setIsSearchOpen((prev) => !prev)}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

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

          {/* ── Mobile Hamburger Menu (Sheet) ── */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <SheetHeader className="p-6 text-left border-b border-border/60">
                <SheetTitle className="text-xl font-semibold tracking-tight">
                  ATELIER<span className="text-muted-foreground">.</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Search bar inside mobile menu */}
                <div className="p-4 border-b border-border/60">
                  <form onSubmit={handleMobileSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={mobileSearch}
                        onChange={(e) => setMobileSearch(e.target.value)}
                        placeholder="Search products..."
                        className="h-11 w-full rounded-none border border-foreground/20 bg-secondary/20 pl-10 pr-3 text-sm outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="h-11 shrink-0 rounded-none px-4 text-[10px] uppercase tracking-widest font-bold bg-foreground text-background hover:bg-foreground/90"
                    >
                      Search
                    </Button>
                  </form>
                </div>

                <nav className="flex flex-col gap-1 p-4">
                  <Link to="/" className="flex items-center h-12 px-4 rounded-none text-base font-medium transition-smooth hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>Home</Link>
                  <Link to="/shop" className="flex items-center h-12 px-4 rounded-none text-base font-medium transition-smooth hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>Shop</Link>

                  <div className="mt-4 mb-2 px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Categories</div>
                  <Link to="/shop" search={{ category: "Electronics" } as any} className="flex items-center h-10 px-4 rounded-none text-sm text-muted-foreground transition-smooth hover:text-foreground">Electronics</Link>
                  <Link to="/shop" search={{ category: "Fashion" } as any} className="flex items-center h-10 px-4 rounded-none text-sm text-muted-foreground transition-smooth hover:text-foreground">Fashion</Link>
                  <Link to="/shop" search={{ category: "Home & Gadgets" } as any} className="flex items-center h-10 px-4 rounded-none text-sm text-muted-foreground transition-smooth hover:text-foreground">Living</Link>

                  {user && (
                    <>
                      <div className="mt-6 mb-2 px-4 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Account</div>
                      <Link to="/orders" className="flex items-center h-12 px-4 rounded-none text-base font-medium transition-smooth hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>My Orders</Link>
                    </>
                  )}

                  {role === "ADMIN" && (
                    <Link to="/admin" className="flex items-center h-12 px-4 rounded-none text-base font-medium text-emerald-500 transition-smooth hover:bg-secondary">Admin Dashboard</Link>
                  )}
                </nav>

                <div className="mt-auto p-4 border-t border-border/60">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <div className="px-4 py-2">
                        <p className="text-sm font-semibold">{user.user_metadata?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Button variant="outline" className="w-full rounded-none justify-start gap-3 h-12 px-4" onClick={() => signOut()}>
                        <LogOut className="h-4 w-4" /> Log out
                      </Button>
                    </div>
                  ) : (
                    <Link to="/login">
                      <Button className="w-full rounded-none h-12 bg-foreground text-background hover:bg-foreground/90">Sign In</Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ── Mobile: Inline Search Bar (slides down below header) ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 bg-background md:hidden"
          >
            <form onSubmit={handleMobileInlineSearch} className="flex gap-2 p-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-11 w-full rounded-none border border-foreground/20 bg-secondary/20 pl-10 pr-3 text-sm outline-none focus:border-foreground transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-none px-5 text-[10px] uppercase tracking-widest font-bold"
              >
                Search
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
