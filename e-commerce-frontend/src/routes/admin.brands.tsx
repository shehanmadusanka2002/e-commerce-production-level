import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Award, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/adminApi";
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

type Brand = { id: string; name: string; logo: string; products: number; _count?: { products: number } };

export const Route = createFileRoute("/admin/brands")({
  component: AdminBrandsPage,
});

function AdminBrandsPage() {
  const [rows, setRows] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  const refresh = () => adminApi.fetchBrands().then(setRows);
  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditing(null);
    setName("");
    setLogo("");
    setOpen(true);
  }
  function startEdit(b: Brand) {
    setEditing(b);
    setName(b.name);
    setLogo(b.logo);
    setOpen(true);
  }
  async function save() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editing) {
        await adminApi.updateBrand(editing.id, name, logo);
        toast.success("Brand updated");
      } else {
        await adminApi.createBrand(name, logo);
        toast.success("Brand added");
      }
      setOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save brand");
    }
  }
  async function remove(id: string) {
    try {
      await adminApi.deleteBrand(id);
      toast.success("Brand removed");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove brand");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage your luxury labels and brand identifiers.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={startCreate} className="gap-2 rounded-none">
              <Plus className="h-4 w-4" /> Add Brand
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="uppercase tracking-widest text-sm">{editing ? "Edit Brand" : "New Brand"}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Brand Logo</Label>
                <div 
                  className="group relative flex h-32 cursor-pointer items-center justify-center border border-dashed border-border bg-secondary/10 transition-colors hover:border-foreground/50"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  {logo ? (
                    <img src={logo} alt="Preview" className="h-full w-full object-contain p-2" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-foreground">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[10px] uppercase tracking-widest">Click to Upload</span>
                    </div>
                  )}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setLogo(reader.result as string);
                          toast.success("Logo uploaded!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-name" className="text-[10px] uppercase tracking-widest text-muted-foreground">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Atelier Noir"
                  className="rounded-none border-none bg-secondary/20 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-logo" className="text-[10px] uppercase tracking-widest text-muted-foreground">...or Logo URL</Label>
                <Input 
                  id="brand-logo" 
                  value={logo} 
                  onChange={(e) => setLogo(e.target.value)} 
                  placeholder="https://example.com/logo.png" 
                  className="rounded-none border-none bg-secondary/20 h-12"
                />
              </div>
            </div>
            <SheetFooter className="mt-10">
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-none uppercase tracking-widest text-[10px]">Cancel</Button>
              <Button onClick={save} className="rounded-none uppercase tracking-widest text-[10px] px-8 h-12">{editing ? "Save Changes" : "Create Brand"}</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="shadow-card rounded-none border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/10">
            <TableRow>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Brand</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold text-center">Logo</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Products</TableHead>
              <TableHead className="w-[120px] text-right uppercase tracking-widest text-[10px] font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                    No brands found. Add your first brand to get started.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((b) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group border-b border-border/50 hover:bg-secondary/5 transition-colors"
                  >
                    <TableCell className="font-semibold text-lg py-4">{b.name}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        {b.logo ? (
                          <div className="h-10 w-10 border border-border bg-white p-1 overflow-hidden">
                            <img 
                              src={b.logo} 
                              alt={b.name} 
                              className="h-full w-full object-contain" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `
                                  <div class="flex h-full w-full items-center justify-center bg-foreground text-background text-xs font-bold uppercase">
                                    ${b.name.charAt(0)}
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center bg-secondary/20 text-muted-foreground font-bold uppercase text-xs">
                            {b.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <Badge variant="secondary" className="rounded-none font-mono font-medium bg-secondary/30 text-foreground/70">
                        {b.products || b._count?.products || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button size="icon" variant="ghost" onClick={() => startEdit(b)} aria-label="Edit" className="hover:bg-foreground hover:text-background rounded-none h-8 w-8 transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Delete" className="text-destructive hover:bg-red-500 hover:text-white rounded-none h-8 w-8 transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-none border-none">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="uppercase tracking-widest text-sm font-bold">Delete Brand?</AlertDialogTitle>
                              <AlertDialogDescription className="text-xs italic leading-relaxed">
                                This will remove the brand <strong>{b.name}</strong>. Products linked to this brand will remain but become unbranded.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6">
                              <AlertDialogCancel className="rounded-none uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => remove(b.id)}
                                className="bg-red-600 text-white hover:bg-red-700 rounded-none uppercase tracking-widest text-[10px] px-8"
                              >
                                Confirm Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
