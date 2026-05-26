import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../../utils/errors';
import { Role } from '@prisma/client';

export const roleMiddleware = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
