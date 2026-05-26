"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const cart_service_1 = __importDefault(require("../../../services/cart.service"));
const order_validator_1 = require("../../validators/order.validator");
class CartController {
    /**
     * Get current user's cart
     * GET /api/buyer/cart
     */
    async getCart(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const cart = await cart_service_1.default.getOrCreateCart(userId);
            res.status(200).json({
                success: true,
                data: cart,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Add item to cart
     * POST /api/buyer/cart/items
     */
    async addItem(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const validatedData = order_validator_1.addToCartSchema.parse(req.body);
            const cart = await cart_service_1.default.addItem(userId, validatedData);
            res.status(200).json({
                success: true,
                data: cart,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update cart item quantity
     * PATCH /api/buyer/cart/items/:itemId
     */
    async updateQuantity(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { itemId } = req.params;
            const { quantity } = order_validator_1.updateCartItemSchema.parse(req.body);
            await cart_service_1.default.updateItemQuantity(userId, itemId, quantity);
            const cart = await cart_service_1.default.getOrCreateCart(userId);
            res.status(200).json({
                success: true,
                data: cart,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Remove item from cart
     * DELETE /api/buyer/cart/items/:itemId
     */
    async removeItem(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { itemId } = req.params;
            await cart_service_1.default.removeItem(userId, itemId);
            const cart = await cart_service_1.default.getOrCreateCart(userId);
            res.status(200).json({
                success: true,
                data: cart,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Clear cart
     * DELETE /api/buyer/cart
     */
    async clearCart(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            await cart_service_1.default.clearCart(userId);
            res.status(200).json({
                success: true,
                message: 'Cart cleared successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CartController = CartController;
exports.default = new CartController();
