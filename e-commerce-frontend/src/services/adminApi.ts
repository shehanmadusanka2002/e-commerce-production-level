import { type Product, type Category } from "@/lib/products";
import { supabase } from '@/lib/supabase';

export const ADMIN_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered";

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  status: OrderStatus;
  date: string;
  items: number;
  whatsappSent: boolean;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
};

export type ProductInput = Omit<Product, "id"> & { stock: number; brandId?: string };

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  };
}

export const adminApi = {
  // ---- Stats ----
  async getOverview() {
    const products = await this.fetchAdminProducts();
    const orders = await this.fetchOrders();
    const customersList = await this.fetchCustomers();

    const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const activeProducts = products.length;
    const customers = customersList.length;
    
    // Alerts Data
    const lowStockProducts = products.filter(p => p.stock < 5);
    const recentOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    const pendingOrders = orders.filter(o => o.status === "Pending");
    
    // Compute last 7 days sales (real data only, 0 if no orders)
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const sales7d = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = days[d.getDay()];
      const dayDate = d.toISOString().split('T')[0];
      const dailyTotal = orders
        .filter(o => o.date === dayDate)
        .reduce((sum, o) => sum + o.total, 0);
      return { day: dayName, sales: dailyTotal };
    });

    // Compute monthly revenue (last 6 months, real data only)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthName = months[d.getMonth()];
      const yearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthlyTotal = orders
        .filter(o => o.date.startsWith(yearMonth))
        .reduce((sum, o) => sum + o.total, 0);
      return { month: monthName, revenue: monthlyTotal };
    });

    // Compute sales by category: group order revenue by product category
    const categoryRevenueMap = products.reduce((acc: Record<string, number>, p) => {
      acc[p.category] = acc[p.category] || 0;
      return acc;
    }, {});
    // Add real order revenue per category using product list
    const productCategoryMap = products.reduce((acc: Record<string, string>, p) => {
      acc[p.id] = p.category;
      return acc;
    }, {});
    // Use order totals grouped by the product categories they contain
    const categoryOrderMap: Record<string, number> = {};
    orders.forEach(o => {
      const cat = productCategoryMap[o.id] || 'Other';
      categoryOrderMap[cat] = (categoryOrderMap[cat] || 0) + o.total;
    });
    // Fall back to product count per category if no order-category mapping exists
    const salesByCategory = Object.keys(categoryRevenueMap).map(name => ({
      name,
      value: categoryOrderMap[name] || products.filter(p => p.category === name).length,
    })).filter(c => c.value > 0);
    
    return { 
      totalRevenue, 
      totalOrders, 
      activeProducts, 
      customers, 
      sales7d,
      monthlyRevenue,
      salesByCategory,
      alerts: {
        lowStock: lowStockProducts,
        pendingOrders: pendingOrders,
        recentOrders: recentOrders
      }
    };
  },

  // ---- Products ----
  async fetchAdminProducts() {
    const res = await fetch(`${ADMIN_BASE_URL}/products`);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    return data.map((p: any) => ({
      id: p.id,
      title: p.name,
      description: p.description || '',
      price: p.price,
      stock: p.stock || 0,
      image: p.images?.[0] || '',
      categoryId: p.categoryId,
      category: p.category?.name || 'Uncategorized',
      brandId: p.brandId,
      brand: p.brand?.name || 'No Brand',
      brandLogo: p.brand?.logo,
      rating: p.rating || 4.5,
    }));
  },
  
  async createProduct(input: ProductInput) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/products`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: input.title,
        price: input.price,
        stock: input.stock,
        rating: input.rating,
        brandId: input.brandId,
        images: input.image ? [input.image] : [],
        description: "New product",
        categoryId: input.category
      }),
    });

    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  },
  
  async updateProduct(id: string, patch: Partial<ProductInput>) {
    const headers = await getAuthHeaders();
    const body: any = {};
    if (patch.title !== undefined) body.name = patch.title;
    if (patch.price !== undefined) body.price = patch.price;
    if (patch.stock !== undefined) body.stock = patch.stock;
    if (patch.rating !== undefined) body.rating = patch.rating;
    if (patch.brandId !== undefined) body.brandId = patch.brandId;
    if (patch.image !== undefined) body.images = patch.image ? [patch.image] : [];
    if (patch.category !== undefined) body.categoryId = patch.category;
    
    const res = await fetch(`${ADMIN_BASE_URL}/products/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  },
  
  async deleteProduct(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return { ok: true };
  },

  // ---- Orders ----
  async fetchOrders() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/orders`, { headers });
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    return data.map((o: any) => ({
      id: o.id,
      customer: o.user?.fullName || (o.user?.email ? o.user.email.split('@')[0] : "Unknown Customer"),
      email: o.user?.email || "",
      phone: o.phone || "",
      total: o.totalAmount,
      status: o.status ? (o.status.charAt(0) + o.status.slice(1).toLowerCase()) : "Pending",
      date: new Date(o.createdAt).toISOString().split('T')[0],
      items: o.orderItems?.length || 0,
      whatsappSent: !!o.whatsappSent,
    }));
  },
  
  async updateOrderStatus(id: string, status: OrderStatus) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/orders/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: status.toUpperCase() }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return res.json();
  },

  async markOrderAsSent(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/orders/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ whatsappSent: true }),
    });
    if (!res.ok) throw new Error("Failed to mark order as sent");
    return res.json();
  },

  async deleteOrder(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/orders/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete order");
    return { ok: true };
  },

  // ---- Customers ----
  async fetchCustomers() {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/users`, { headers });
    if (!res.ok) throw new Error("Failed to fetch customers");
    const data = await res.json();
    
    return data.map((u: any) => {
      const orders = u.orders || [];
      const spent = orders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      return {
        id: u.id,
        name: u.fullName || u.email.split('@')[0],
        email: u.email,
        orders: orders.length,
        spent,
        joined: new Date(u.createdAt).toISOString().split('T')[0],
      };
    });
  },

  async deleteCustomer(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete customer");
    return { ok: true };
  },
  
  // ---- Categories ----
  async fetchCategories() {
    const res = await fetch(`${ADMIN_BASE_URL}/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), // Simple slug fallback
      products: c._count?.products || 0,
    }));
  },
  
  async createCategory(name: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/categories`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
  },
  
  async updateCategory(id: string, name: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/categories/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
  },
  
  async deleteCategory(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete category");
    return { ok: true };
  },

  // ---- Brands ----
  async fetchBrands() {
    const res = await fetch(`${ADMIN_BASE_URL}/brands`);
    if (!res.ok) throw new Error("Failed to fetch brands");
    const data = await res.json();
    return data.map((b: any) => ({
      id: b.id,
      name: b.name,
      logo: b.logo || "",
      products: b._count?.products || 0,
    }));
  },
  
  async createBrand(name: string, logo?: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/brands`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, logo }),
    });
    if (!res.ok) throw new Error("Failed to create brand");
    return res.json();
  },
  
  async updateBrand(id: string, name: string, logo?: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/brands/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ name, logo }),
    });
    if (!res.ok) throw new Error("Failed to update brand");
    return res.json();
  },
  
  async deleteBrand(id: string) {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ADMIN_BASE_URL}/brands/${id}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) throw new Error("Failed to delete brand");
    return { ok: true };
  },
};

export const CATEGORY_OPTIONS: Category[] = ["Electronics", "Fashion", "Home & Gadgets"];
