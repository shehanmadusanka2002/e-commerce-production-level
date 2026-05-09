import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
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
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { adminApi, type ProductInput } from "@/services/adminApi";
import type { Product } from "@/lib/products";
import { Plus, Pencil, Trash2, ImagePlus, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

type Row = Product & { stock: number };

const EMPTY: ProductInput = {
  title: "",
  price: 0,
  image: "",
  category: "",
  brand: "",
  stock: 0,
  rating: 4.5,
};

function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY);

  const refresh = async () => {
    adminApi.fetchAdminProducts().then(setRows);
    adminApi.fetchCategories().then(setCategories);
    adminApi.fetchBrands().then(setBrands);
  };
  useEffect(() => { refresh(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (r: Row) => {
    setEditingId(r.id);
    setForm({ 
      title: r.title || (r as any).name, 
      price: r.price, 
      image: r.image, 
      category: (r as any).categoryId, 
      brandId: (r as any).brandId, 
      brand: r.brand, 
      stock: r.stock, 
      rating: r.rating 
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, form);
        toast.success("Product updated successfully");
      } else {
        await adminApi.createProduct(form);
        toast.success("New product created");
      }
      setOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const remove = async (id: string) => {
    try {
      await adminApi.deleteProduct(id);
      toast.success("Product removed");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Manage your luxury catalogue identifiers and stock levels.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={openCreate} className="rounded-none gap-2 px-6 h-11 uppercase tracking-widest text-[10px] font-bold">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg border-none shadow-2xl">
            <SheetHeader className="border-b border-border pb-6 mb-8">
              <SheetTitle className="uppercase tracking-[0.2em] italic text-xl font-bold">{editingId ? "Edit Product" : "New Product"}</SheetTitle>
              <SheetDescription className="text-xs uppercase tracking-widest">Update your boutique inventory details</SheetDescription>
            </SheetHeader>
            <form onSubmit={submit} className="space-y-8 pb-12">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Product Imagery</Label>
                <div 
                  className="group relative flex h-48 cursor-pointer items-center justify-center border border-dashed border-border bg-secondary/10 transition-all hover:border-foreground/50 overflow-hidden"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-contain p-4" />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-foreground">
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Select Visual Asset</span>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, image: reader.result as string });
                          toast.success("Image asset loaded");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <Input
                  placeholder="…or provide a direct cloud URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="rounded-none border-none bg-secondary/20 h-10 text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] uppercase tracking-widest text-muted-foreground">Product Title</Label>
                <Input id="title" required value={form.title} placeholder="e.g. Minimalist Gold Chronograph"
                  onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-none border-none bg-secondary/20 h-12 font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[10px] uppercase tracking-widest text-muted-foreground">Retail Price (RS.)</Label>
                  <Input id="price" type="number" min={0} required value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="rounded-none border-none bg-secondary/20 h-12 tabular-nums" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-[10px] uppercase tracking-widest text-muted-foreground">Inventory Count</Label>
                  <Input id="stock" type="number" min={0} required value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="rounded-none border-none bg-secondary/20 h-12 tabular-nums" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Department / Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="rounded-none border-none bg-secondary/20 h-12"><SelectValue placeholder="Assign Category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c: any) => (
                        <SelectItem key={c.id} value={c.id} className="rounded-none">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Manufacturer / Brand</Label>
                  <Select value={form.brandId} onValueChange={(v) => setForm({ ...form, brandId: v })}>
                    <SelectTrigger className="rounded-none border-none bg-secondary/20 h-12"><SelectValue placeholder="Assign Brand" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((b: any) => (
                        <SelectItem key={b.id} value={b.id} className="rounded-none">{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <SheetFooter className="mt-8 pt-8 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-none uppercase tracking-widest text-[10px]">Cancel</Button>
                <Button type="submit" className="rounded-none h-12 px-10 uppercase tracking-widest text-[10px] bg-black text-white hover:bg-black/80">
                  {editingId ? "Update Asset" : "Finalize Product"}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="shadow-card border-none rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Item Detail</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Category</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Brand</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Valuation</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Rating</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Stock</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {rows.map((r) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="group hover:bg-secondary/5 transition-colors border-b border-border/50"
                >
                  <TableCell>
                    <div className="flex items-center gap-4 py-1">
                      <div className="h-12 w-12 shrink-0 bg-secondary/20 overflow-hidden border border-border/30">
                        {r.image ? (
                          <img src={r.image} alt={r.title} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><ImagePlus className="h-4 w-4 opacity-10" /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm block truncate">{r.title}</span>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-widest block mt-0.5 font-mono">{r.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-none bg-secondary/30 text-foreground/70 text-[10px] uppercase font-bold px-2">{r.categoryName || r.category}</Badge></TableCell>
                  <TableCell className="text-muted-foreground font-medium italic text-xs">{r.brand}</TableCell>
                  <TableCell className="text-right tabular-nums font-bold">RS. {r.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Star className="h-3 w-3 fill-current text-foreground" />
                      <span className="font-bold text-xs tabular-nums">{r.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "text-xs font-bold font-mono px-2 py-1 rounded-none",
                      r.stock < 5 ? "bg-red-500/10 text-red-600" : "bg-green-500/10 text-green-600"
                    )}>
                      {r.stock.toString().padStart(2, '0')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(r)} className="h-8 w-8 hover:bg-foreground hover:text-background rounded-none">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-500 hover:text-white rounded-none">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="uppercase tracking-widest font-bold text-sm italic">Decommission Product?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs leading-relaxed italic">
                              This will permanently remove <strong>{r.title}</strong> from the boutique catalogue. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-none uppercase tracking-widest text-[10px]">Retain</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => remove(r.id)}
                              className="bg-red-600 text-white hover:bg-red-700 rounded-none uppercase tracking-widest text-[10px] px-8"
                            >
                              Decommission
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-24 text-center text-xs uppercase tracking-widest text-muted-foreground italic">
                    Catalogue Empty. Initialize your first asset.
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
