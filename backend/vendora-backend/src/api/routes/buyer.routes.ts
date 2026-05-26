import { Router } from 'express';
import productCatalogController from '../controllers/buyer/productCatalog.controller';
import categoryController from '../controllers/shared/category.controller';
import cartController from '../controllers/buyer/cart.controller';
import wishlistController from '../controllers/buyer/wishlist.controller';
import checkoutController from '../controllers/buyer/checkout.controller';
import aiAssistantController from '../controllers/buyer/aiAssistant.controller';
import visualSearchController, { uploadMiddleware } from '../controllers/buyer/visualSearch.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Product Catalog for Buyers
router.get('/products', productCatalogController.listProducts);
router.get('/products/featured', productCatalogController.getFeaturedProducts);
router.get('/products/:slug', productCatalogController.getProductDetail);

// Categories
router.get('/categories', categoryController.listCategories);

// Cart
router.use(authMiddleware);

router.get('/cart', cartController.getCart);
router.post('/cart/items', cartController.addItem);
router.patch('/cart/items/:itemId', cartController.updateQuantity);
router.delete('/cart/items/:itemId', cartController.removeItem);
router.delete('/cart', cartController.clearCart);

// Wishlist
router.get('/wishlist', wishlistController.getWishlist);
router.post('/wishlist', wishlistController.addToWishlist);
router.post('/wishlist/toggle', wishlistController.toggleWishlist);
router.delete('/wishlist/:productId', wishlistController.removeFromWishlist);

// Checkout & Orders
router.post('/checkout', checkoutController.initiateCheckout);
router.post('/checkout/verify', checkoutController.verifyPayment);
router.get('/orders', checkoutController.getMyOrders);
router.get('/orders/:id', checkoutController.getOrderDetail);
router.post('/orders/:id/cancel', checkoutController.cancelOrder);

// AI Shopping Assistant
router.post('/ai/chat', aiAssistantController.chat);
router.post('/ai/budget-suggestions', aiAssistantController.getBudgetSuggestions);
router.post('/ai/gift-recommendations', aiAssistantController.getGiftRecommendations);

// Visual Search
router.post('/visual-search', uploadMiddleware, visualSearchController.search);

export default router;
