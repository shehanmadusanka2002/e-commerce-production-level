import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Atelier" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await api.login(String(form.get("email")).trim(), String(form.get("password")));
      toast.success("Welcome back");
      nav({ to: "/" }); // Auth store will handle role-based navigation if needed, or user can click Admin link
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue shopping.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required /></div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>
      <Button 
        variant="outline" 
        className="w-full" 
        size="lg" 
        onClick={async () => {
          try {
            await useAuth.getState().signInWithGoogle();
          } catch (err: any) {
            toast.error(err.message || "Google sign in failed");
          }
        }}
      >
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/signup" className="font-medium text-foreground hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
