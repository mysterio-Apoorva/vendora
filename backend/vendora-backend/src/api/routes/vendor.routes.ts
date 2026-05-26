import { Router } from 'express';
import inventoryController from '../controllers/vendor/inventory.controller';
import fulfillmentController from '../controllers/vendor/orderFulfillment.controller';
import vendorController from '../controllers/vendor/vendor.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Public vendor registration (for any authenticated user)
router.post('/register', vendorController.register);

// Role-based protection for vendor-only routes
router.use(roleMiddleware([Role.VENDOR]));

// Dashboard & Profile
router.get('/dashboard', vendorController.getDashboard);
router.get('/profile', vendorController.getProfile);
router.patch('/profile', vendorController.updateProfile);

// Product Management
router.post('/products', inventoryController.createProduct);
router.get('/products', inventoryController.getMyProducts);
router.patch('/products/:id', inventoryController.updateProduct);
router.delete('/products/:id', inventoryController.deleteProduct);

// Variant Management
router.post('/products/:productId/variants', inventoryController.addVariant);
router.patch('/variants/:id', inventoryController.updateVariant);
router.delete('/variants/:id', inventoryController.deleteVariant);

// Order Fulfillment
router.get('/orders', fulfillmentController.getMyOrders);
router.patch('/orders/:itemId/status', fulfillmentController.updateStatus);

export default router;
