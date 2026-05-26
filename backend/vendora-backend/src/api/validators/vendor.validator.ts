import { z } from 'zod';

export const registerVendorSchema = z.object({
  storeName: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  gstin: z.string().length(15).optional(),
  pan: z.string().length(10).optional(),
  bankAccount: z.string().min(9).max(18).optional(),
  ifscCode: z.string().length(11).optional(),
  upiId: z.string().optional(),
  logoUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const updateVendorProfileSchema = registerVendorSchema.partial();

export const updateOrderItemStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  trackingNumber: z.string().optional(),
  courier: z.string().optional(),
});
