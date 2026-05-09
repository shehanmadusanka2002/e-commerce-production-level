import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

type AuthState = {
  user: User | null;
  role: string | null;
  loading: boolean;
  setUser: (user: User | null, role?: string | null) => void;
  signOut: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user, role = null) => set({ user, role, loading: false }),
  signOut: async () => {
    // Clear local state FIRST before token is gone
    useCart.getState().clearLocal();
    useWishlist.getState().clear();
    await supabase.auth.signOut();
    set({ user: null, role: null });
  },
}));

async function syncUserRole(user: User, session: any) {
  if (!session?.access_token) return null;

  try {
    // Use AbortController for a 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        email: user.email,
        fullName: user.user_metadata?.full_name
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const dbUser = await res.json();
      return dbUser.role;
    }
  } catch (e) {
    console.error("Failed to sync user role:", e);
  }
  return null;
}

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user ?? null;

  // On sign-out, clear user state, cart and wishlist immediately
  if (event === 'SIGNED_OUT') {
    useAuth.getState().setUser(null, null);
    useCart.getState().clearLocal();
    useWishlist.getState().clear();
    return;
  }

  // Set user immediately so UI updates
  useAuth.getState().setUser(user, null);

  if (user && session) {
    // Fetch saved cart and wishlist from server after login
    useCart.getState().fetch();
    useWishlist.getState().fetch();
    // Sync role in background
    syncUserRole(user, session).then(role => {
      if (role) {
        useAuth.getState().setUser(user, role);
      }
    });
  }
});

// Initial check
supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user ?? null;
  if (user && session) {
    const role = await syncUserRole(user, session);
    useAuth.getState().setUser(user, role);
    // Restore cart and wishlist from server on page load
    useCart.getState().fetch();
    useWishlist.getState().fetch();
  } else {
    useAuth.getState().setUser(null, null);
  }
});
