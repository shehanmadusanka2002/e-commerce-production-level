export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  blurb?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  categoryName?: string;
  brand: string;
  rating: number;
  trending?: boolean;
};

export const CATEGORIES: { name: Category; blurb: string }[] = [
  { name: "Electronics", blurb: "Sound, sight & smart wear" },
  { name: "Fashion", blurb: "Wardrobe essentials, refined" },
  { name: "Home & Gadgets", blurb: "Pieces for daily rituals" },
];

export const PRODUCTS: Product[] = [
  { 
    id: "1", 
    name: "Studio Wireless Headphones", 
    description: "High-quality wireless headphones with noise cancellation.",
    price: 249, 
    stock: 50,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e"], 
    categoryId: "Electronics", 
    brand: "Aurex", 
    rating: 4.8, 
    trending: true 
  },
  { 
    id: "2", 
    name: "Onyx Smartwatch Series 5", 
    description: "The ultimate health and fitness companion.",
    price: 329, 
    stock: 30,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30"], 
    categoryId: "Electronics", 
    brand: "Nordic", 
    rating: 4.6, 
    trending: true 
  },
  { 
    id: "3", 
    name: "Classic Low-Top Sneakers", 
    description: "Timeless style for everyday comfort.",
    price: 119, 
    stock: 100,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"], 
    categoryId: "Fashion", 
    brand: "Pleias", 
    rating: 4.5, 
    trending: true 
  },
];

export const BRANDS = Array.from(new Set(PRODUCTS.map(p => p.brand))).sort();
