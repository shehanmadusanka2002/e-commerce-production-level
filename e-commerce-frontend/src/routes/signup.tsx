import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useCart } from "@/store/cart";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — NEXORA" }] }),
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
      
      const guestId = localStorage.getItem('guest_id');
      if (guestId) {
        await api.mergeCart(guestId);
        localStorage.removeItem('guest_id');
      }
      await useCart.getState().fetch();
      
      toast.success("Account created");
      
      if (dbUser?.role === 'ADMIN') {
        nav({ to: "/admin" });
      } else {
        const redirect = localStorage.getItem('redirectAfterAuth') || "/";
        localStorage.removeItem('redirectAfterAuth');
        nav({ to: redirect as any });
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="mr-2 h-5 w-5">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
