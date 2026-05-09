import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { adminApi, type AdminOrder, type OrderStatus } from "@/services/adminApi";
import { Trash2, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const refresh = () => adminApi.fetchOrders().then(setOrders);
  useEffect(() => { refresh(); }, []);

  const updateStatus = async (id: string, s: OrderStatus) => {
    try {
      await adminApi.updateOrderStatus(id, s);
      toast.success(`Order ${s.toLowerCase()}`);
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.deleteOrder(id);
      toast.success("Order removed from records");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const sendWhatsApp = async (o: AdminOrder) => {
    if (!o.phone) {
      toast.error("No phone number for this customer");
      return;
    }
    
    let phone = o.phone.replace(/\D/g, ''); 
    if (phone.length === 9 && (phone.startsWith('7') || phone.startsWith('1'))) {
       phone = '94' + phone;
    } else if (phone.length === 10 && phone.startsWith('0')) {
       phone = '94' + phone.substring(1);
    }
    
    const message = `Hello ${o.customer}, Your order #${o.id.slice(0, 8)} for RS. ${o.total.toLocaleString()} has been received! We will process it soon. - Atelier Store`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
    
    try {
      await adminApi.markOrderAsSent(o.id);
      refresh();
    } catch (e) {
      console.error("Failed to mark as sent", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Oversee client acquisitions and manage distribution statuses.</p>
        </div>
      </div>

      <Card className="shadow-card border-none rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Reference</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Client</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Acquisition Date</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold text-center">Volume</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Valuation</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Logistics State</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Concierge</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {orders.map((o) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group hover:bg-secondary/5 transition-colors border-b border-border/50"
                >
                  <TableCell className="font-mono text-[10px] text-muted-foreground font-bold tracking-tighter">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{o.customer}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{o.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-center font-mono text-xs">{o.items.toString().padStart(2, '0')}</TableCell>
                  <TableCell className="font-bold text-sm tabular-nums">RS. {o.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                      <SelectTrigger className="h-9 w-[140px] rounded-none border-none bg-secondary/20 font-bold text-[10px] uppercase tracking-widest">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-none shadow-2xl">
                        {["Pending", "Processing", "Shipped", "Delivered"].map((s) => (
                          <SelectItem key={s} value={s} className="rounded-none text-[10px] uppercase tracking-widest">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {o.whatsappSent ? (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-9 gap-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-none font-bold text-[10px] uppercase tracking-widest border-none"
                        onClick={() => sendWhatsApp(o)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Notified
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-9 gap-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-none font-bold text-[10px] uppercase tracking-widest transition-all"
                        onClick={() => sendWhatsApp(o)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Notify Client
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-500 hover:text-white rounded-none transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="uppercase tracking-widest font-bold text-sm italic">Purge Order Record?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs leading-relaxed italic">
                              This will permanently erase the acquisition record for <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>. This action is irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-none uppercase tracking-widest text-[10px]">Retain</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => remove(o.id)}
                              className="bg-red-600 text-white hover:bg-red-700 rounded-none uppercase tracking-widest text-[10px] px-8"
                            >
                              Confirm Purge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-24 text-center text-xs uppercase tracking-widest text-muted-foreground italic">
                    Acquisition Log Empty. No recent orders recorded.
                  </TableCell>
                </TableRow>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
