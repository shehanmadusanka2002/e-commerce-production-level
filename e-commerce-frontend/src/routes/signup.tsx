import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Atelier" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const authData = await api.signup(
        String(form.get("email")).trim(), 
        String(form.get("password")), 
        String(form.get("name")).trim()
      );
      
      // Sync with backend to get role and ensure DB record exists
      const dbUser = await api.syncUser(authData.user?.email || '', authData.user?.user_metadata?.full_name);
      
      toast.success("Account created");
      
      if (dbUser?.role === 'ADMIN') {
        nav({ to: "/admin" });
      } else {
        nav({ to: "/" });
      }
    } catch (err: any) { 
      toast.error(err.message || "Sign up failed"); 
    }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Start curating your wardrobe today.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" required /></div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={6} /></div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" className="w-full" size="lg" onClick={() => toast.info("Google OAuth — connect Lovable Cloud to enable")}>
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
