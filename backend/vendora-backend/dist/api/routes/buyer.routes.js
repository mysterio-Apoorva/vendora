"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productCatalog_controller_1 = __importDefault(require("../controllers/buyer/productCatalog.controller"));
const category_controller_1 = __importDefault(require("../controllers/shared/category.controller"));
const cart_controller_1 = __importDefault(require("../controllers/buyer/cart.controller"));
const wishlist_controller_1 = __importDefault(require("../controllers/buyer/wishlist.controller"));
const checkout_controller_1 = __importDefault(require("../controllers/buyer/checkout.controller"));
const aiAssistant_controller_1 = __importDefault(require("../controllers/buyer/aiAssistant.controller"));
const visualSearch_controller_1 = __importStar(require("../controllers/buyer/visualSearch.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Product Catalog for Buyers
router.get('/products', productCatalog_controller_1.default.listProducts);
router.get('/products/featured', productCatalog_controller_1.default.getFeaturedProducts);
router.get('/products/:slug', productCatalog_controller_1.default.getProductDetail);
// Categories
router.get('/categories', category_controller_1.default.listCategories);
// Cart
router.use(auth_middleware_1.authMiddleware);
router.get('/cart', cart_controller_1.default.getCart);
router.post('/cart/items', cart_controller_1.default.addItem);
router.patch('/cart/items/:itemId', cart_controller_1.default.updateQuantity);
router.delete('/cart/items/:itemId', cart_controller_1.default.removeItem);
router.delete('/cart', cart_controller_1.default.clearCart);
// Wishlist
router.get('/wishlist', wishlist_controller_1.default.getWishlist);
router.post('/wishlist', wishlist_controller_1.default.addToWishlist);
router.post('/wishlist/toggle', wishlist_controller_1.default.toggleWishlist);
router.delete('/wishlist/:productId', wishlist_controller_1.default.removeFromWishlist);
// Checkout & Orders
router.post('/checkout', checkout_controller_1.default.initiateCheckout);
router.post('/checkout/verify', checkout_controller_1.default.verifyPayment);
router.get('/orders', checkout_controller_1.default.getMyOrders);
router.get('/orders/:id', checkout_controller_1.default.getOrderDetail);
router.post('/orders/:id/cancel', checkout_controller_1.default.cancelOrder);
// AI Shopping Assistant
router.post('/ai/chat', aiAssistant_controller_1.default.chat);
router.post('/ai/budget-suggestions', aiAssistant_controller_1.default.getBudgetSuggestions);
router.post('/ai/gift-recommendations', aiAssistant_controller_1.default.getGiftRecommendations);
// Visual Search
router.post('/visual-search', visualSearch_controller_1.uploadMiddleware, visualSearch_controller_1.default.search);
exports.default = router;
