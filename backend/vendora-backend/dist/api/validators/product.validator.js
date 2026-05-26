"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.updateCategorySchema = exports.createCategorySchema = exports.updateVariantSchema = exports.createVariantSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(255),
    categoryId: zod_1.z.string().uuid(),
    description: zod_1.z.string().optional(),
    shortDesc: zod_1.z.string().max(500).optional(),
    price: zod_1.z.number().positive(),
    comparePrice: zod_1.z.number().positive().optional(),
    costPrice: zod_1.z.number().positive().optional(),
    sku: zod_1.z.string().min(3).max(50),
    barcode: zod_1.z.string().optional(),
    stock: zod_1.z.number().int().nonnegative().default(0),
    lowStockThreshold: zod_1.z.number().int().nonnegative().default(5),
    trackInventory: zod_1.z.boolean().default(true),
    weightGrams: zod_1.z.number().int().positive().optional(),
    lengthCm: zod_1.z.number().int().positive().optional(),
    widthCm: zod_1.z.number().int().positive().optional(),
    heightCm: zod_1.z.number().int().positive().optional(),
    images: zod_1.z.array(zod_1.z.object({
        url: zod_1.z.string().url(),
        publicId: zod_1.z.string(),
        alt: zod_1.z.string().optional(),
        order: zod_1.z.number().int().optional(),
    })).default([]),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    attributes: zod_1.z.record(zod_1.z.any()).default({}),
    status: zod_1.z.nativeEnum(client_1.ProductStatus).default(client_1.ProductStatus.DRAFT),
    isFeatured: zod_1.z.boolean().default(false),
});
exports.updateProductSchema = exports.createProductSchema.partial().omit({
    sku: true,
});
// --- Variant Validators ---
exports.createVariantSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    attributes: zod_1.z.record(zod_1.z.any()).default({}),
    price: zod_1.z.number().positive(),
    stock: zod_1.z.number().int().nonnegative(),
    sku: zod_1.z.string().min(3).max(50),
    barcode: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url().optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateVariantSchema = exports.createVariantSchema.partial().omit({
    sku: true,
});
// --- Category Validators ---
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url().optional(),
    parentId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().default(true),
    sortOrder: zod_1.z.number().int().default(0),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
exports.productQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(Number).default('1'),
    limit: zod_1.z.string().optional().transform(Number).default('10'),
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.string().optional().transform(Number),
    maxPrice: zod_1.z.string().optional().transform(Number),
    sort: zod_1.z.enum(['price_asc', 'price_desc', 'newest', 'rating', 'sales']).default('newest'),
    status: zod_1.z.nativeEnum(client_1.ProductStatus).optional(),
});
