"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const wishlist_service_1 = __importDefault(require("../../../services/wishlist.service"));
const order_validator_1 = require("../../validators/order.validator");
class WishlistController {
    /**
     * Get current user's wishlist
     * GET /api/buyer/wishlist
     */
    async getWishlist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const wishlist = await wishlist_service_1.default.getWishlist(userId);
            res.status(200).json({
                success: true,
                data: wishlist,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Add item to wishlist
     * POST /api/buyer/wishlist
     */
    async addToWishlist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { productId } = order_validator_1.wishlistSchema.parse(req.body);
            const item = await wishlist_service_1.default.addToWishlist(userId, productId);
            res.status(201).json({
                success: true,
                data: item,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Toggle item in wishlist
     * POST /api/buyer/wishlist/toggle
     */
    async toggleWishlist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { productId } = order_validator_1.wishlistSchema.parse(req.body);
            const result = await wishlist_service_1.default.toggleWishlist(userId, productId);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Remove item from wishlist
     * DELETE /api/buyer/wishlist/:productId
     */
    async removeFromWishlist(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { productId } = req.params;
            await wishlist_service_1.default.removeFromWishlist(userId, productId);
            res.status(200).json({
                success: true,
                message: 'Product removed from wishlist',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WishlistController = WishlistController;
exports.default = new WishlistController();
