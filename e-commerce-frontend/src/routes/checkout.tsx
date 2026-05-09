import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/store/cart";
import { api } from "@/services/api";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { Check, CreditCard, Truck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Atelier" }] }),
  component: CheckoutPage,
});

import { motion, AnimatePresence } from "framer-motion";

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // Step 4 is Success
  const [payment, setPayment] = useState<"cod" | "card">("card");
  const [contact, setContact] = useState({ 
    name: user?.user_metadata?.full_name || "", 
    email: user?.email || "", 
    phone: "",
    address: "" 
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (items.length === 0 && step !== 4) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link to="/shop" className="mt-4 inline-block"><Button className="rounded-none">Browse the shop</Button></Link>
      </div>
    );
  }

  async function placeOrder() {
    if (!user) {
      toast.error("Please login to place an order");
      nav({ to: "/login" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.placeOrder({
        items: items.map(i => ({ id: i.id, qty: i.qty, price: i.price })),
        total: total(),
        paymentMethod: payment,
        userId: user.id,
        userEmail: contact.email || user.email || 'user@example.com',
        phone: contact.phone,
        shippingAddress: contact.address,
      });
      setOrderId(res.orderId);
      clear();
      setStep(4); // Move to Success State
    } catch (err) { 
      console.error(err);
      toast.error("Could not place order"); 
    }
    finally { setLoading(false); }
  }

  if (step === 4) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-foreground text-background mb-8"
        >
          <Check className="h-12 w-12" />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold tracking-tighter uppercase italic">Order Confirmed</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Thank you for choosing ATELIER. Your order <span className="font-mono font-bold text-foreground">#{orderId}</span> has been placed successfully. 
            We've sent a confirmation to <span className="font-medium text-foreground">{contact.email}</span>.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/"><Button variant="outline" className="rounded-none h-12 px-8 uppercase tracking-widest text-[10px]">Back to Home</Button></Link>
            <Link to="/shop"><Button className="rounded-none h-12 px-8 uppercase tracking-widest text-[10px]">Continue Shopping</Button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 font-medium">Secured Checkout</p>
        <h1 className="text-5xl font-bold tracking-tighter uppercase italic">Finalize Order</h1>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-bold mb-12">
        {[
          { n: 1, label: "Contact" },
          { n: 2, label: "Payment" },
          { n: 3, label: "Review" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={`flex h-6 w-6 items-center justify-center rounded-none transition-colors duration-300 ${step >= s.n ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              {step > s.n ? <Check className="h-3 w-3" /> : s.n}
            </div>
            <span className={step >= s.n ? "text-foreground" : "text-muted-foreground/50"}>{s.label}</span>
            {i < 2 && <div className="mx-4 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-16 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest border-b border-border pb-3">Contact & Shipping</h2>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Full name</Label><Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} required className="rounded-none border-none bg-secondary/20 h-12" /></div>
                    <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Email</Label><Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} required className="rounded-none border-none bg-secondary/20 h-12" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">WhatsApp Number (Mobile)</Label>
                    <Input 
                      placeholder="+94 77 123 4567" 
                      value={contact.phone} 
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })} 
                      required 
                      className="rounded-none border-none bg-secondary/20 h-12" 
                    />
                  </div>
                  <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Shipping address</Label><Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} required className="rounded-none border-none bg-secondary/20 h-12" /></div>
                </div>
                <Button size="lg" onClick={() => setStep(2)} disabled={!contact.name || !contact.email || !contact.phone || !contact.address} className="rounded-none h-14 px-10 uppercase tracking-widest text-xs">Continue to payment</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest border-b border-border pb-3">Payment Method</h2>
                  <RadioGroup value={payment} onValueChange={(v) => setPayment(v as "cod" | "card")} className="grid gap-3">
                    <Label className="flex cursor-pointer items-center gap-4 rounded-none border border-border p-5 transition-all has-[:checked]:border-foreground has-[:checked]:bg-secondary/20">
                      <RadioGroupItem value="card" />
                      <CreditCard className="h-6 w-6" />
                      <div className="flex-1"><div className="text-sm font-bold uppercase tracking-wider">Credit Card</div><div className="text-[10px] text-muted-foreground uppercase mt-0.5">Instant secure payment</div></div>
                    </Label>
                    <Label className="flex cursor-pointer items-center gap-4 rounded-none border border-border p-5 transition-all has-[:checked]:border-foreground has-[:checked]:bg-secondary/20">
                      <RadioGroupItem value="cod" />
                      <Truck className="h-6 w-6" />
                      <div className="flex-1"><div className="text-sm font-bold uppercase tracking-wider">Cash on Delivery</div><div className="text-[10px] text-muted-foreground uppercase mt-0.5">Pay when your order arrives</div></div>
                    </Label>
                  </RadioGroup>
                  {payment === "card" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 rounded-none border border-border p-6 bg-secondary/10">
                      <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Card number</Label><Input placeholder="4242 4242 4242 4242" className="rounded-none border-none bg-background h-12" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Expiry</Label><Input placeholder="MM/YY" className="rounded-none border-none bg-background h-12" /></div>
                        <div className="space-y-2"><Label className="text-[10px] uppercase tracking-widest text-muted-foreground">CVC</Label><Input placeholder="123" className="rounded-none border-none bg-background h-12" /></div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="rounded-none h-14 uppercase tracking-widest text-xs">Back</Button>
                  <Button size="lg" onClick={() => setStep(3)} className="rounded-none h-14 px-10 uppercase tracking-widest text-xs">Review Order</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-lg font-bold uppercase tracking-widest border-b border-border pb-3">Final Review</h2>
                  <div className="rounded-none border border-border p-6 space-y-4 bg-secondary/10">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Shipping To</p>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Payment Method</p>
                      <p className="font-medium uppercase tracking-wider text-sm">{payment === "card" ? "Credit Card" : "Cash on Delivery"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="ghost" size="lg" onClick={() => setStep(2)} className="rounded-none h-14 uppercase tracking-widest text-xs">Back</Button>
                  <Button size="lg" onClick={placeOrder} disabled={loading} className="rounded-none h-14 px-12 uppercase tracking-widest text-xs bg-black text-white hover:bg-black/80">
                    {loading ? (
                      <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        Processing Order...
                      </motion.span>
                    ) : "Complete Order"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="h-fit rounded-none border-none bg-foreground text-background p-8 sticky top-8">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 pb-4 border-b border-background/20">Bag Summary</h3>
          <ul className="space-y-6">
            {items.map((i) => (
              <li key={i.id} className="flex gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden bg-background/10">
                  <img src={i.images?.[0]} alt={i.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest truncate">{i.name}</div>
                  <div className="text-[10px] text-background/50 uppercase mt-1">Qty {i.qty}</div>
                  <div className="text-sm font-bold mt-1">RS. {(i.price * i.qty).toFixed(2)}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 space-y-3 border-t border-background/20 pt-8">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-background/60"><span>Subtotal</span><span>RS. {total().toFixed(2)}</span></div>
            <div className="flex justify-between text-[10px] uppercase tracking-[0.1em] text-background/60"><span>Shipping</span><span className="text-green-400">Complimentary</span></div>
            <div className="mt-6 flex justify-between text-xl font-bold tracking-tighter"><span>Total</span><span>RS. {total().toFixed(2)}</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
