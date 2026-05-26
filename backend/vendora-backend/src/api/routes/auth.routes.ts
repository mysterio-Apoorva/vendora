import { Router } from 'express';
import authController from '../controllers/shared/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/sync', authController.syncUser);
router.get('/me', authMiddleware, authController.getProfile);

export default router;
