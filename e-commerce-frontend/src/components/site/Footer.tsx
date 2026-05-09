import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="text-3xl font-bold tracking-tighter uppercase italic">ATELIER.</Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-zinc-400">
              Curating exceptional objects for the modern minimalist. We source directly from independent artisans to bring you considered pieces that stand the test of time.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Collections</h4>
              <ul className="mt-6 space-y-4 text-xs uppercase tracking-widest text-zinc-400">
                <li><Link to="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Essentials</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Limited Series</Link></li>
                <li><Link to="/shop" className="hover:text-white transition-colors">Bespoke</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Boutique</h4>
              <ul className="mt-6 space-y-4 text-xs uppercase tracking-widest text-zinc-400">
                <li><Link to="/" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Journal</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Stockists</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Support</h4>
              <ul className="mt-6 space-y-4 text-xs uppercase tracking-widest text-zinc-400">
                <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Shipping</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">The Society</h4>
            <p className="mt-6 text-xs text-zinc-400 leading-relaxed uppercase tracking-widest">
              Join our community for early access and exclusive drops.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <div className="relative group">
                <Input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="rounded-none border-zinc-800 bg-zinc-900/50 h-12 text-[10px] tracking-widest uppercase focus-visible:ring-1 focus-visible:ring-white transition-all pr-12"
                />
                <Button variant="ghost" className="absolute right-0 top-0 h-12 w-12 rounded-none hover:bg-transparent hover:text-white text-zinc-500">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[9px] text-zinc-500 uppercase tracking-tighter mt-2">By subscribing, you agree to our Privacy Policy.</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-zinc-800 pt-8 lg:flex-row">
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              © {new Date().getFullYear()} ATELIER LUXURY RETAIL. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6 text-[9px] uppercase tracking-widest text-zinc-600">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>

          {/* Payment Icons Placeholder */}
          <div className="flex items-center gap-4 grayscale opacity-40 hover:opacity-80 transition-opacity">
             <div className="h-6 w-10 bg-zinc-800 rounded-sm flex items-center justify-center font-bold text-[8px]">VISA</div>
             <div className="h-6 w-10 bg-zinc-800 rounded-sm flex items-center justify-center font-bold text-[8px]">MC</div>
             <div className="h-6 w-10 bg-zinc-800 rounded-sm flex items-center justify-center font-bold text-[8px]">AMEX</div>
             <div className="h-6 w-10 bg-zinc-800 rounded-sm flex items-center justify-center font-bold text-[8px]">APPLE</div>
             <div className="h-6 w-10 bg-zinc-800 rounded-sm flex items-center justify-center font-bold text-[8px]">STRIPE</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
