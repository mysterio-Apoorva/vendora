import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const wishlistSchema = z.object({
  productId: z.string().uuid(),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['razorpay', 'cod']).default('razorpay'),
});

export const paymentVerificationSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});
