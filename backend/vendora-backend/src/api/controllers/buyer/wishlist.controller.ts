import { Request, Response, NextFunction } from 'express';
import wishlistService from '../../../services/wishlist.service';
import { wishlistSchema } from '../../validators/order.validator';

export class WishlistController {
  /**
   * Get current user's wishlist
   * GET /api/buyer/wishlist
   */
  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const wishlist = await wishlistService.getWishlist(userId);

      res.status(200).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to wishlist
   * POST /api/buyer/wishlist
   */
  async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { productId } = wishlistSchema.parse(req.body);

      const item = await wishlistService.addToWishlist(userId, productId);

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle item in wishlist
   * POST /api/buyer/wishlist/toggle
   */
  async toggleWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { productId } = wishlistSchema.parse(req.body);

      const result = await wishlistService.toggleWishlist(userId, productId);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from wishlist
   * DELETE /api/buyer/wishlist/:productId
   */
  async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { productId } = req.params;

      await wishlistService.removeFromWishlist(userId, productId);

      res.status(200).json({
        success: true,
        message: 'Product removed from wishlist',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new WishlistController();
