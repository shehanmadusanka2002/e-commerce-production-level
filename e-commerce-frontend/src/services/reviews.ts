import { supabase } from '@/lib/supabase';

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export type Review = {
  id: string;
  rating: number;
  comment: string;
  images: string[];
  productId: string;
  userId: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
  };
};

export type CreateReviewInput = {
  rating: number;
  comment?: string;
  images?: string[];
  productId: string;
};

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
}

export const reviewsApi = {
  async fetchByProduct(productId: string): Promise<Review[]> {
    const res = await fetch(`${API_URL}/reviews/product/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
  },

  async fetchAll(): Promise<any[]> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reviews`, { headers });
    if (!res.ok) throw new Error("Failed to fetch all reviews");
    return res.json();
  },

  async create(input: CreateReviewInput): Promise<Review> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to submit review");
    }
    return res.json();
  },

  async deleteReview(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/reviews/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete review");
  }
};
