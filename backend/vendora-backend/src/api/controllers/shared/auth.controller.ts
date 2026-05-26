import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/prisma';
import { BadRequestError } from '../../../utils/errors';

export class AuthController {
  /**
   * Sync Clerk user with local DB
   * This would typically be called by a webhook or after frontend login
   */
  async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { clerkId, email, name, avatarUrl } = req.body;

      if (!clerkId || !email) {
        throw new BadRequestError('Missing required user data');
      }

      const user = await prisma.user.upsert({
        where: { clerkId },
        update: {
          email,
          name,
          avatarUrl,
        },
        create: {
          clerkId,
          email,
          name,
          avatarUrl,
        },
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendorProfile: true },
      });

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
