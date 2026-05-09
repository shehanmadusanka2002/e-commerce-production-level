import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Package, ChevronRight, Clock, Truck, CheckCircle, AlertCircle, MapPin, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/orders")({
  component: MyOrdersPage,
});

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any }> = {
  PENDING: { label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800 border-indigo-200", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 border-red-200", icon: AlertCircle },
};

function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.fetchMyOrders()
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 animate-pulse">
        <div className="h-8 w-48 bg-secondary/20 rounded mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 w-full bg-secondary/10 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground">Manage and track your recent purchases.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center rounded-none border-dashed">
          <div className="mb-4 rounded-full bg-secondary/20 p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-medium">No orders found</h2>
          <p className="mb-8 text-muted-foreground">It looks like you haven't placed any orders yet.</p>
          <Link to="/shop">
            <Button className="rounded-none px-8">Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Desktop View */}
          <Card className="hidden rounded-none border-border bg-background lg:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="font-semibold py-5">Order ID</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Total Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const Icon = config.icon;
                  return (
                    <TableRow key={order.id} className="group border-border/50 transition-colors hover:bg-secondary/5">
                      <TableCell className="font-medium py-6">#{order.id}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="font-medium">RS. {order.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${config.color}`}>
                          <Icon className="mr-1.5 h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" className="rounded-none gap-2 text-xs uppercase tracking-widest font-bold hover:bg-foreground hover:text-background transition-smooth">
                              View Details <ChevronRight className="h-3 w-3" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-xl rounded-none border-l border-border bg-background p-0 overflow-y-auto">
                            <div className="p-8 space-y-8">
                              <SheetHeader className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <SheetTitle className="text-2xl font-semibold tracking-tight uppercase">Order Details</SheetTitle>
                                  <Badge variant="outline" className={`rounded-none px-3 py-1 text-[10px] uppercase tracking-widest font-bold ${config.color}`}>
                                    {config.label}
                                  </Badge>
                                </div>
                                <SheetDescription className="text-sm font-medium">
                                  Order ID: #{order.id} • Placed on {new Date(order.createdAt).toLocaleDateString()}
                                </SheetDescription>
                              </SheetHeader>

                              <div className="space-y-6">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground pb-2 border-b border-border">
                                  <Package className="h-3 w-3" /> Ordered Items
                                </div>
                                <div className="space-y-4">
                                  {order.orderItems?.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 group">
                                      <div className="h-20 w-20 shrink-0 overflow-hidden bg-secondary/20 border border-border/50">
                                        <img src={item.product?.images?.[0]} alt="" className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
                                      </div>
                                      <div className="flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                          <h4 className="text-sm font-medium leading-tight">{item.product?.name}</h4>
                                          <span className="text-sm font-semibold">RS. {(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          {item.quantity} x RS. {item.price.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-border">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> Shipping Address
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                                    {order.shippingAddress}
                                  </p>
                                </div>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                    <CreditCard className="h-3 w-3" /> Payment
                                  </div>
                                  <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">
                                    {order.paymentMethod === 'STRIPE' ? 'Credit / Debit Card' : 'Cash on Delivery'}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-4 pt-8 border-t border-border">
                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                  <Receipt className="h-3 w-3" /> Order Summary
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>RS. {order.totalAmount?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-emerald-600 font-medium uppercase text-[10px]">Free</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-border font-bold text-lg">
                                    <span>Total</span>
                                    <span>RS. {order.totalAmount?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile/Tablet View */}
          <div className="grid gap-4 lg:hidden">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              return (
                <Card key={order.id} className="rounded-none border-border p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold tracking-tight">#{order.id}</span>
                    <Badge variant="outline" className={`rounded-none text-[10px] uppercase tracking-widest font-bold ${config.color}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Total</span>
                    <span>RS. {order.total.toLocaleString()}</span>
                  </div>
                  <Button variant="outline" className="w-full rounded-none uppercase tracking-widest text-[10px] font-bold h-10">
                    View Details
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
