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
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
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

type Category = { id: string; name: string; slug: string; products: number; _count?: { products: number } };

function slugify(text: string) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const refresh = () => adminApi.fetchCategories().then(setRows);
  useEffect(() => { refresh(); }, []);

  function startCreate() {
    setEditing(null);
    setName("");
    setSlug("");
    setOpen(true);
  }
  function startEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setOpen(true);
  }
  async function save() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editing) {
        await adminApi.updateCategory(editing.id, name);
        toast.success("Category updated");
      } else {
        await adminApi.createCategory(name);
        toast.success("Category added");
      }
      setOpen(false);
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  }
  async function remove(id: string) {
    try {
      await adminApi.deleteCategory(id);
      toast.success("Category removed");
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">Organize your luxury catalog into browsable, SEO-friendly departments.</p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={startCreate} className="gap-2 rounded-none h-11 px-6 uppercase tracking-widest text-[10px] font-bold">
              <Plus className="h-4 w-4" /> Add Category
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md border-none shadow-2xl">
            <SheetHeader className="border-b border-border pb-6 mb-8">
              <SheetTitle className="uppercase tracking-[0.2em] italic text-xl font-bold">{editing ? "Edit Category" : "New Category"}</SheetTitle>
            </SheetHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cat-name" className="text-[10px] uppercase tracking-widest text-muted-foreground">Category Designation</Label>
                <Input
                  id="cat-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editing) setSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Haute Couture"
                  className="rounded-none border-none bg-secondary/20 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug" className="text-[10px] uppercase tracking-widest text-muted-foreground">SEO Handle (Slug)</Label>
                <Input id="cat-slug" value={slug} readOnly={!!editing} onChange={(e) => setSlug(e.target.value)} placeholder="haute-couture" className="rounded-none border-none bg-secondary/10 h-12 font-mono text-xs opacity-70" />
                <p className="text-[9px] text-muted-foreground uppercase tracking-wider italic">Slugs are automatically generated for catalog consistency.</p>
              </div>
            </div>
            <SheetFooter className="mt-10 pt-8 border-t border-border">
              <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-none uppercase tracking-widest text-[10px]">Cancel</Button>
              <Button onClick={save} className="rounded-none h-12 px-10 uppercase tracking-widest text-[10px] bg-black text-white hover:bg-black/80">{editing ? "Save Designation" : "Initialize Category"}</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="shadow-card border-none rounded-none overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">Designation</TableHead>
              <TableHead className="uppercase tracking-widest text-[10px] font-bold">SEO Identifier</TableHead>
              <TableHead className="text-right uppercase tracking-widest text-[10px] font-bold">Product Count</TableHead>
              <TableHead className="w-[120px] text-right uppercase tracking-widest text-[10px] font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {rows.map((c) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group hover:bg-secondary/5 transition-colors border-b border-border/50"
                >
                  <TableCell className="font-bold py-5 text-sm flex items-center gap-3">
                    <div className="h-8 w-8 bg-secondary/20 flex items-center justify-center rounded-none"><Tag className="h-3.5 w-3.5 opacity-40" /></div>
                    {c.name}
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-none font-mono text-[10px] bg-secondary/30 text-foreground/60 px-2">/{c.slug}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="font-mono font-bold text-xs bg-foreground text-background px-2 py-1">{c.products || c._count?.products || 0}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(c)} className="h-8 w-8 hover:bg-foreground hover:text-background rounded-none transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-500 hover:text-white rounded-none transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="uppercase tracking-widest font-bold text-sm italic">Dissolve Category?</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs italic leading-relaxed">
                              Removing <strong>{c.name}</strong> will leave associated products without a department assignment.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-none uppercase tracking-widest text-[10px]">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => remove(c.id)}
                              className="bg-red-600 text-white hover:bg-red-700 rounded-none uppercase tracking-widest text-[10px] px-8"
                            >
                              Dissolve
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
                  <TableCell colSpan={4} className="py-24 text-center text-xs uppercase tracking-widest text-muted-foreground italic">
                    Organization Empty. Define your first department.
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
