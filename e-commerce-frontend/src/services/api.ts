import type { Product, Category } from "@/lib/products";
import { supabase } from '@/lib/supabase';

export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export type ProductFilters = {
  category?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
};

// Helper to map backend product to frontend Product type
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  description: p.description || '',
  price: p.price,
  stock: p.stock || 0,
  images: p.images || [],
  categoryId: p.categoryId,
  categoryName: p.category?.name || 'Uncategorized',
  brand: p.brand?.name || p.brand || 'Atelier',
  rating: p.rating || 4.5,
  trending: p.trending
});

// Helper to get auth headers with robust session checking
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    console.error("No active session or access token found");
    return { 'Content-Type': 'application/json' };
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
}

export const api = {
  // GET /products
  async getProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append('categoryId', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await fetch(`${BASE_URL}/products?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    const data = await response.json();
    return data.map(mapProduct);
  },

  // GET /products/:id
  async getProductById(id: string): Promise<Product> {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Product not found');
    const data = await response.json();
    return mapProduct(data);
  },

  // GET /products/trending
  async getTrending(): Promise<Product[]> {
    return this.getProducts(); 
  },

  // GET /categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  // POST /orders
  async placeOrder(payload: {
    items: { id: string; qty: number; price: number }[];
    total: number;
    paymentMethod: "cod" | "card";
    userId: string;
    userEmail: string;
    phone: string;
    shippingAddress: string;
  }): Promise<{ orderId: string }> {
    const headers = await getAuthHeaders();
    
    if (!headers['Authorization']) {
      throw new Error('You must be logged in to place an order. Please try logging out and in again.');
    }

    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        userId: payload.userId,
        userEmail: payload.userEmail,
        phone: payload.phone,
        shippingAddress: payload.shippingAddress,
        totalAmount: payload.total,
        paymentMethod: payload.paymentMethod === 'cod' ? 'COD' : 'STRIPE',
        items: payload.items.map(i => ({
          productId: i.id,
          quantity: i.qty,
          price: i.price
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Order failed:", errorData);
      throw new Error(errorData.message || 'Failed to place order');
    }
    
    const data = await response.json();
    return { orderId: data.id };
  },

  // Auth methods
  async signup(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async syncUser(email: string, fullName?: string) {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) return null;

    const response = await fetch(`${BASE_URL}/users/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, fullName }),
    });
    
    if (!response.ok) {
      console.error('Failed to sync user with backend');
      return null;
    }
    
    return response.json();
  },

  async fetchMyOrders(): Promise<any[]> {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) return [];

    const response = await fetch(`${BASE_URL}/orders/my-orders`, { headers });
    if (!response.ok) throw new Error('Failed to fetch orders');
    
    const data = await response.json();
    // Map backend response to match UI expectations
    return data.map((o: any) => ({
      id: o.id,
      createdAt: o.createdAt,
      // Handle both totalAmount and total for safety
      total: o.totalAmount || o.total || 0,
      totalAmount: o.totalAmount || o.total || 0,
      status: o.status,
      // Ensure orderItems is an array even if missing
      orderItems: o.orderItems || [],
      shippingAddress: o.shippingAddress || 'No address provided',
      paymentMethod: o.paymentMethod || 'UNKNOWN'
    }));
  },

  async fetchWishlist(): Promise<Product[]> {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) return [];

    const response = await fetch(`${BASE_URL}/wishlist`, { headers });
    if (!response.ok) throw new Error('Failed to fetch wishlist');
    
    const data = await response.json();
    return data.map(mapProduct);
  },

  async toggleWishlist(productId: string): Promise<{ status: 'added' | 'removed' }> {
    const headers = await getAuthHeaders();
    if (!headers['Authorization']) {
      throw new Error('Please login to use the wishlist');
    }

    const response = await fetch(`${BASE_URL}/wishlist/toggle/${productId}`, {
      method: 'POST',
      headers
    });
    
    if (!response.ok) throw new Error('Failed to update wishlist');
    return response.json();
  },

  async getBrands() {
    const res = await fetch(`${BASE_URL}/brands`);
    if (!res.ok) throw new Error('Failed to fetch brands');
    return res.json();
  },
};
