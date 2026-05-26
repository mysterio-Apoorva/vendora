"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class WishlistService {
    /**
     * Get user wishlist
     */
    async getWishlist(userId) {
        return prisma_1.default.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        images: true,
                        status: true,
                        rating: true,
                        reviewCount: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    /**
     * Add product to wishlist
     */
    async addToWishlist(userId, productId) {
        // Check if already in wishlist
        const existing = await prisma_1.default.wishlist.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        if (existing) {
            return existing;
        }
        return prisma_1.default.wishlist.create({
            data: { userId, productId },
        });
    }
    /**
     * Remove product from wishlist
     */
    async removeFromWishlist(userId, productId) {
        return prisma_1.default.wishlist.delete({
            where: {
                userId_productId: { userId, productId },
            },
        });
    }
    /**
     * Toggle wishlist item
     */
    async toggleWishlist(userId, productId) {
        const existing = await prisma_1.default.wishlist.findUnique({
            where: {
                userId_productId: { userId, productId },
            },
        });
        if (existing) {
            await prisma_1.default.wishlist.delete({
                where: { id: existing.id },
            });
            return { added: false };
        }
        else {
            await prisma_1.default.wishlist.create({
                data: { userId, productId },
            });
            return { added: true };
        }
    }
}
exports.WishlistService = WishlistService;
exports.default = new WishlistService();
