import { Router } from 'express';
import categoryController from '../controllers/shared/category.controller';
import adminController from '../controllers/admin/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(roleMiddleware([Role.ADMIN]));

// Platform Stats
router.get('/stats', adminController.getStats);

// Vendor Management
router.patch('/vendors/:id/status', adminController.updateVendorStatus);

// Category Management
router.post('/categories', categoryController.createCategory);
router.patch('/categories/:id', categoryController.updateCategory);

// Fraud Management
router.post('/fraud', adminController.flagFraud);
router.patch('/fraud/:id', adminController.updateFraudStatus);

// Commission Management
router.post('/commissions', adminController.setCommission);

export default router;
