"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const slugify_1 = __importDefault(require("slugify"));
class VendorService {
    /**
     * Register a new vendor profile for an existing user
     */
    async registerVendor(userId, data) {
        const slug = (0, slugify_1.default)(data.storeName, { lower: true });
        // Check if store name is unique
        const existingStore = await prisma_1.default.vendorProfile.findUnique({
            where: { storeName: data.storeName },
        });
        if (existingStore) {
            throw new Error('Store name already exists');
        }
        return prisma_1.default.$transaction(async (tx) => {
            // Create profile
            const profile = await tx.vendorProfile.create({
                data: {
                    ...data,
                    userId,
                    slug,
                    status: client_1.VendorStatus.PENDING,
                },
            });
            // Update user role
            await tx.user.update({
                where: { id: userId },
                data: { role: client_1.Role.VENDOR },
            });
            return profile;
        });
    }
    /**
     * Get vendor dashboard statistics
     */
    async getDashboardStats(vendorId) {
        const [stats, recentOrders, lowStockCountResult] = await Promise.all([
            prisma_1.default.vendorProfile.findUnique({
                where: { id: vendorId },
                select: {
                    totalRevenue: true,
                    totalOrders: true,
                    totalProducts: true,
                    rating: true,
                    reviewCount: true,
                },
            }),
            prisma_1.default.orderItem.findMany({
                where: { vendorId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: { select: { orderNumber: true, buyer: { select: { name: true } } } },
                    product: { select: { name: true } },
                },
            }),
            prisma_1.default.$queryRaw `
        SELECT COUNT(*)::int as count 
        FROM products 
        WHERE vendor_id = ${vendorId} 
        AND stock <= low_stock_threshold 
        AND status = 'ACTIVE'
      `,
        ]);
        const lowStockCount = lowStockCountResult[0]?.count || 0;
        // Calculate monthly earnings (simple version)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const monthlyEarnings = await prisma_1.default.orderItem.aggregate({
            where: {
                vendorId,
                createdAt: { gte: startOfMonth },
                itemStatus: client_1.ItemStatus.DELIVERED,
            },
            _sum: {
                vendorPayout: true,
            },
        });
        return {
            stats,
            monthlyEarnings: monthlyEarnings._sum.vendorPayout || 0,
            recentOrders,
            lowStockCount,
        };
    }
    /**
     * List orders for a vendor
     */
    async getVendorOrders(vendorId, query) {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;
        const where = {
            vendorId,
        };
        if (status)
            where.itemStatus = status;
        const [items, total] = await Promise.all([
            prisma_1.default.orderItem.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: { select: { orderNumber: true, createdAt: true } },
                    product: { select: { name: true, images: true } },
                    variant: { select: { name: true } },
                },
            }),
            prisma_1.default.orderItem.count({ where }),
        ]);
        return {
            items,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Update order item fulfillment status
     */
    async updateFulfillmentStatus(vendorId, orderItemId, data) {
        const item = await prisma_1.default.orderItem.findFirst({
            where: { id: orderItemId, vendorId },
        });
        if (!item) {
            throw new Error('Order item not found or unauthorized');
        }
        const updateData = { itemStatus: data.status };
        if (data.status === client_1.ItemStatus.SHIPPED) {
            updateData.shippedAt = new Date();
            updateData.trackingNumber = data.trackingNumber;
            updateData.courier = data.courier;
        }
        else if (data.status === client_1.ItemStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        return prisma_1.default.orderItem.update({
            where: { id: orderItemId },
            data: updateData,
        });
    }
    /**
     * Get vendor profile details
     */
    async getVendorProfile(vendorId) {
        return prisma_1.default.vendorProfile.findUnique({
            where: { id: vendorId },
            include: {
                user: { select: { name: true, email: true, avatarUrl: true } },
            },
        });
    }
    /**
     * Update vendor profile
     */
    async updateProfile(vendorId, data) {
        const updateData = { ...data };
        if (data.storeName) {
            updateData.slug = (0, slugify_1.default)(data.storeName, { lower: true });
        }
        return prisma_1.default.vendorProfile.update({
            where: { id: vendorId },
            data: updateData,
        });
    }
}
exports.VendorService = VendorService;
exports.default = new VendorService();
