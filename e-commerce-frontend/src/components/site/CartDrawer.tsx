import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, total } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md rounded-none">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-widest">
            <ShoppingBag className="h-4 w-4" /> Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-sm text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center bg-secondary/40 rounded-none">
                <ShoppingBag className="h-8 w-8 opacity-40" />
              </div>
              <p>Your cart is currently empty.</p>
              <Button variant="outline" size="sm" onClick={close} className="rounded-none">Continue Shopping</Button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4">
                  <div className="h-24 w-24 flex-none overflow-hidden bg-secondary/30 rounded-none">
                    <img 
                      src={i.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200&auto=format&fit=crop'} 
                      alt={i.name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{i.brand}</p>
                        <h4 className="mt-1 truncate text-sm font-medium leading-tight">{i.name}</h4>
                      </div>
                      <button onClick={() => remove(i.id)} aria-label="Remove" className="text-muted-foreground transition-smooth hover:text-foreground">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center border border-border rounded-none">
                        <button className="p-2" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease"><Minus className="h-3 w-3" /></button>
                        <span className="w-8 text-center text-sm font-medium">{i.qty}</span>
                        <button className="p-2" onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase"><Plus className="h-3 w-3" /></button>
                      </div>
                      <div className="text-sm font-semibold">RS. {(i.price * i.qty).toFixed(2)}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t border-border bg-secondary/20 px-6 py-6">
            <div className="w-full space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>RS. {total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>RS. {total().toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" onClick={close} className="block">
                <Button className="w-full bg-black text-white hover:bg-black/80 h-12 rounded-none uppercase tracking-widest text-xs" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
