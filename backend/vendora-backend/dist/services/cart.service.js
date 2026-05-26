"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class CartService {
    /**
     * Get or create a cart for a user
     */
    async getOrCreateCart(userId) {
        let cart = await prisma_1.default.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                images: true,
                                status: true,
                                vendorId: true,
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            cart = await prisma_1.default.cart.create({
                data: { userId },
                include: { items: true },
            });
        }
        return this.calculateTotals(cart);
    }
    /**
     * Add an item to the cart
     */
    async addItem(userId, data) {
        const cart = await this.getOrCreateCart(userId);
        // Check product existence and price
        const product = await prisma_1.default.product.findUnique({
            where: { id: data.productId },
            select: { price: true, status: true },
        });
        if (!product || product.status !== client_1.ProductStatus.ACTIVE) {
            throw new Error('Product not available');
        }
        let priceSnapshot = product.price;
        // Check variant if provided
        if (data.variantId) {
            const variant = await prisma_1.default.productVariant.findUnique({
                where: { id: data.variantId, productId: data.productId },
                select: { price: true, isActive: true },
            });
            if (!variant || !variant.isActive) {
                throw new Error('Product variant not available');
            }
            priceSnapshot = variant.price;
        }
        // Upsert cart item
        await prisma_1.default.cartItem.upsert({
            where: {
                cartId_productId_variantId: {
                    cartId: cart.id,
                    productId: data.productId,
                    variantId: data.variantId || null,
                },
            },
            update: {
                quantity: { increment: data.quantity },
                priceSnapshot,
            },
            create: {
                cartId: cart.id,
                productId: data.productId,
                variantId: data.variantId,
                quantity: data.quantity,
                priceSnapshot,
            },
        });
        return this.getOrCreateCart(userId);
    }
    /**
     * Update item quantity
     */
    async updateItemQuantity(userId, itemId, quantity) {
        const cart = await this.getOrCreateCart(userId);
        const item = await prisma_1.default.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) {
            throw new Error('Cart item not found');
        }
        return prisma_1.default.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });
    }
    /**
     * Remove item from cart
     */
    async removeItem(userId, itemId) {
        const cart = await this.getOrCreateCart(userId);
        return prisma_1.default.cartItem.deleteMany({
            where: { id: itemId, cartId: cart.id },
        });
    }
    /**
     * Clear cart
     */
    async clearCart(userId) {
        const cart = await prisma_1.default.cart.findUnique({ where: { userId } });
        if (cart) {
            await prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
    }
    /**
     * Internal helper to calculate cart totals
     */
    calculateTotals(cart) {
        let subtotal = new client_1.Prisma.Decimal(0);
        const items = cart.items.map((item) => {
            const price = item.variant ? item.variant.price : item.product.price;
            const total = new client_1.Prisma.Decimal(price).mul(item.quantity);
            subtotal = subtotal.add(total);
            return {
                ...item,
                price,
                total,
            };
        });
        return {
            ...cart,
            items,
            subtotal,
            total: subtotal, // For now, total = subtotal (no tax/shipping yet)
        };
    }
}
exports.CartService = CartService;
exports.default = new CartService();
