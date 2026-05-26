export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'BUYER' | 'VENDOR' | 'ADMIN';
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  vendorId: string;
  category: Category;
  vendor: Vendor;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  description?: string;
  isApproved: boolean;
  userId: string;
  user: User;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  userId: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface AnalyticsData {
  sales: { date: string; amount: number }[];
  totalRevenue: number;
  totalOrders: number;
  topProducts: { name: string; sales: number }[];
}
