import { Router } from 'express';
import vendorRoutes from './vendor.routes';
import buyerRoutes from './buyer.routes';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vendor', vendorRoutes);
router.use('/buyer', buyerRoutes);
router.use('/admin', adminRoutes);

export default router;
