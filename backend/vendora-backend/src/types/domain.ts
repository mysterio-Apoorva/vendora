import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  clerkId: string;
  role: Role;
  vendorId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CartItemWithDetails {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: any;
  };
  variant?: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}
