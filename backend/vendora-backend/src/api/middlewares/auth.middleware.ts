import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import prisma from '../../config/prisma';

/**
 * Simple authentication middleware
 * In production, this would verify Clerk JWTs
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Attach user to request
    (req as any).user = {
      id: user.id,
      clerkId: user.clerkId,
      role: user.role,
      vendorId: user.vendorProfile?.id,
    };

    next();
  } catch (error) {
    next(error);
  }
};
