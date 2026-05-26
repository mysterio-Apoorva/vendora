import { z } from 'zod';
import { ProductStatus } from '@prisma/client';

export const createProductSchema = z.object({
  name: z.string().min(3).max(255),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
  shortDesc: z.string().max(500).optional(),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  sku: z.string().min(3).max(50),
  barcode: z.string().optional(),
  stock: z.number().int().nonnegative().default(0),
  lowStockThreshold: z.number().int().nonnegative().default(5),
  trackInventory: z.boolean().default(true),
  weightGrams: z.number().int().positive().optional(),
  lengthCm: z.number().int().positive().optional(),
  widthCm: z.number().int().positive().optional(),
  heightCm: z.number().int().positive().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string(),
    alt: z.string().optional(),
    order: z.number().int().optional(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.any()).default({}),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  isFeatured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial().omit({
  sku: true,
});

// --- Variant Validators ---
export const createVariantSchema = z.object({
  name: z.string().min(1),
  attributes: z.record(z.any()).default({}),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  sku: z.string().min(3).max(50),
  barcode: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = createVariantSchema.partial().omit({
  sku: true,
});

// --- Category Validators ---
export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const productQuerySchema = z.object({
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('10'),
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional().transform(Number),
  maxPrice: z.string().optional().transform(Number),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'sales']).default('newest'),
  status: z.nativeEnum(ProductStatus).optional(),
});
