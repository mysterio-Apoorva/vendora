import api from './api';
import { Product, Category, Order, CartItem } from '../types';

export const buyerService = {
  getProducts: async (params?: any) => {
    const response = await api.get<Product[]>('/buyer/products', { params });
    return response.data;
  },
  getProduct: async (id: string) => {
    const response = await api.get<Product>(`/buyer/products/${id}`);
    return response.data;
  },
  getCategories: async () => {
  try {
    const response = await api.get<Category[]>('/buyer/categories');
    return response.data;
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [];
  }
},   // <- THIS COMMA IS IMPORTANT

getCart: async () => {
  return [];
},
    addToCart: async (productId: string, quantity: number) => {
      const response = await api.post('/buyer/cart', { productId, quantity });
      return response.data;
    },
      updateCartItem: async (id: string, quantity: number) => {
        const response = await api.put(`/buyer/cart/${id}`, { quantity });
        return response.data;
      },
        removeFromCart: async (id: string) => {
          const response = await api.delete(`/buyer/cart/${id}`);
          return response.data;
        },
          createOrder: async (data: any) => {
            const response = await api.post<Order>('/buyer/orders', data);
            return response.data;
          },
            getOrders: async () => {
              const response = await api.get<Order[]>('/buyer/orders');
              return response.data;
            },
              getOrder: async (id: string) => {
                const response = await api.get<Order>(`/buyer/orders/${id}`);
                return response.data;
              },
};

export const vendorService = {
  getInventory: async () => {
    const response = await api.get<Product[]>('/vendor/inventory');
    return response.data;
  },
  createProduct: async (data: any) => {
    const response = await api.post<Product>('/vendor/products', data);
    return response.data;
  },
  updateProduct: async (id: string, data: any) => {
    const response = await api.put<Product>(`/vendor/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/vendor/products/${id}`);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get<Order[]>('/vendor/orders');
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.patch(`/vendor/orders/${id}/status`, { status });
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get('/vendor/analytics');
    return response.data;
  },
};

export const adminService = {
  getPendingVendors: async () => {
    const response = await api.get('/admin/vendors/pending');
    return response.data;
  },
  approveVendor: async (id: string) => {
    const response = await api.post(`/admin/vendors/${id}/approve`);
    return response.data;
  },
  getFraudAlerts: async () => {
    const response = await api.get('/admin/fraud-alerts');
    return response.data;
  },
  getPlatformAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
};

export const aiService = {
  chat: async (message: string) => {
    const response = await api.post('/buyer/ai/chat', { message });
    return response.data;
  },
  visualSearch: async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await api.post('/buyer/ai/visual-search', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getRecommendations: async () => {
    return [];
  },
};
