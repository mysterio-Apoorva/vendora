"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
class InventoryService {
    /**
     * Create a new product for a vendor
     */
    async createProduct(vendorId, data) {
        const slug = (0, slugify_1.default)(data.name, { lower: true }) + '-' + Math.random().toString(36).substring(2, 7);
        return prisma_1.default.product.create({
            data: {
                ...data,
                vendorId,
                slug,
                // Ensure price is handled as Decimal by Prisma
                price: new client_1.Prisma.Decimal(data.price),
                comparePrice: data.comparePrice ? new client_1.Prisma.Decimal(data.comparePrice) : null,
                costPrice: data.costPrice ? new client_1.Prisma.Decimal(data.costPrice) : null,
            },
        });
    }
    /**
     * Update an existing product
     */
    async updateProduct(productId, vendorId, data) {
        // Ensure the product belongs to the vendor
        const product = await prisma_1.default.product.findFirst({
            where: { id: productId, vendorId },
        });
        if (!product) {
            throw new Error('Product not found or unauthorized');
        }
        const updateData = { ...data };
        if (data.name) {
            updateData.slug = (0, slugify_1.default)(data.name, { lower: true }) + '-' + Math.random().toString(36).substring(2, 7);
        }
        if (data.price)
            updateData.price = new client_1.Prisma.Decimal(data.price);
        if (data.comparePrice)
            updateData.comparePrice = new client_1.Prisma.Decimal(data.comparePrice);
        if (data.costPrice)
            updateData.costPrice = new client_1.Prisma.Decimal(data.costPrice);
        return prisma_1.default.product.update({
            where: { id: productId },
            data: updateData,
        });
    }
    /**
     * Delete a product (or archive it)
     */
    async deleteProduct(productId, vendorId) {
        const product = await prisma_1.default.product.findFirst({
            where: { id: productId, vendorId },
        });
        if (!product) {
            throw new Error('Product not found or unauthorized');
        }
        // Instead of hard delete, we archive
        await prisma_1.default.product.update({
            where: { id: productId },
            data: { status: client_1.ProductStatus.ARCHIVED },
        });
    }
    /**
     * Get all products for a vendor with pagination
     */
    async getVendorProducts(vendorId, query) {
        const { page = 1, limit = 10, search, status, category } = query;
        const skip = (page - 1) * limit;
        const where = {
            vendorId,
            status: { not: client_1.ProductStatus.ARCHIVED },
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (status)
            where.status = status;
        if (category)
            where.categoryId = category;
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { category: true },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get products for buyers with filters and search
     */
    async getCatalogProducts(query) {
        const { page = 1, limit = 12, search, category, minPrice, maxPrice, sort } = query;
        const skip = (page - 1) * limit;
        const where = {
            status: client_1.ProductStatus.ACTIVE,
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
            ];
        }
        if (category) {
            where.category = {
                OR: [
                    { id: category },
                    { slug: category },
                    { parentId: category }, // Also include products from subcategories if needed
                ],
            };
        }
        if (minPrice || maxPrice) {
            where.price = {
                gte: minPrice ? new client_1.Prisma.Decimal(minPrice) : undefined,
                lte: maxPrice ? new client_1.Prisma.Decimal(maxPrice) : undefined,
            };
        }
        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc')
            orderBy = { price: 'asc' };
        if (sort === 'price_desc')
            orderBy = { price: 'desc' };
        if (sort === 'rating')
            orderBy = { rating: 'desc' };
        if (sort === 'sales')
            orderBy = { salesCount: 'desc' };
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: { select: { name: true, slug: true } },
                    vendor: { select: { storeName: true, slug: true, rating: true } },
                },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get product detail by slug
     */
    async getProductBySlug(slug) {
        const product = await prisma_1.default.product.findUnique({
            where: { slug },
            include: {
                category: true,
                vendor: true,
                variants: true,
                reviews: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true, avatarUrl: true } } },
                },
            },
        });
        if (!product || product.status === client_1.ProductStatus.ARCHIVED) {
            throw new Error('Product not found');
        }
        // Increment view count asynchronously
        prisma_1.default.product.update({
            where: { id: product.id },
            data: { viewCount: { increment: 1 } },
        }).catch(console.error);
        return product;
    }
    // --- Variant Management ---
    /**
     * Add a variant to a product
     */
    async addVariant(productId, vendorId, data) {
        const product = await prisma_1.default.product.findFirst({
            where: { id: productId, vendorId },
        });
        if (!product) {
            throw new Error('Product not found or unauthorized');
        }
        return prisma_1.default.productVariant.create({
            data: {
                ...data,
                productId,
                price: new client_1.Prisma.Decimal(data.price),
            },
        });
    }
    /**
     * Update a product variant
     */
    async updateVariant(variantId, vendorId, data) {
        const variant = await prisma_1.default.productVariant.findFirst({
            where: { id: variantId, product: { vendorId } },
        });
        if (!variant) {
            throw new Error('Variant not found or unauthorized');
        }
        const updateData = { ...data };
        if (data.price)
            updateData.price = new client_1.Prisma.Decimal(data.price);
        return prisma_1.default.productVariant.update({
            where: { id: variantId },
            data: updateData,
        });
    }
    /**
     * Delete a variant
     */
    async deleteVariant(variantId, vendorId) {
        const variant = await prisma_1.default.productVariant.findFirst({
            where: { id: variantId, product: { vendorId } },
        });
        if (!variant) {
            throw new Error('Variant not found or unauthorized');
        }
        return prisma_1.default.productVariant.delete({
            where: { id: variantId },
        });
    }
    // --- Category Management ---
    /**
     * Create a new category (Admin only typically)
     */
    async createCategory(data) {
        const slug = (0, slugify_1.default)(data.name, { lower: true });
        return prisma_1.default.category.create({
            data: {
                ...data,
                slug,
            },
        });
    }
    /**
     * Update a category
     */
    async updateCategory(id, data) {
        const updateData = { ...data };
        if (data.name) {
            updateData.slug = (0, slugify_1.default)(data.name, { lower: true });
        }
        return prisma_1.default.category.update({
            where: { id },
            data: updateData,
        });
    }
    /**
     * List all categories (Tree structure)
     */
    async getCategories(activeOnly = true) {
        const categories = await prisma_1.default.category.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { sortOrder: 'asc' },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        // Build tree
        const categoryMap = {};
        categories.forEach(cat => categoryMap[cat.id] = { ...cat, children: [] });
        const tree = [];
        categories.forEach(cat => {
            if (cat.parentId && categoryMap[cat.parentId]) {
                categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
            }
            else {
                tree.push(categoryMap[cat.id]);
            }
        });
        return tree;
    }
}
exports.InventoryService = InventoryService;
exports.default = new InventoryService();
