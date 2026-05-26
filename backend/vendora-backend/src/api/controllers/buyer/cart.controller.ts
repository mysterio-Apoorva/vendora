import { Request, Response, NextFunction } from 'express';
import cartService from '../../../services/cart.service';
import { addToCartSchema, updateCartItemSchema } from '../../validators/order.validator';

export class CartController {
  /**
   * Get current user's cart
   * GET /api/buyer/cart
   */
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      
      const cart = await cartService.getOrCreateCart(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/buyer/cart/items
   */
  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const validatedData = addToCartSchema.parse(req.body);
      
      const cart = await cartService.addItem(userId, validatedData);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   * PATCH /api/buyer/cart/items/:itemId
   */
  async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { itemId } = req.params;
      const { quantity } = updateCartItemSchema.parse(req.body);

      await cartService.updateItemQuantity(userId, itemId, quantity);
      const cart = await cartService.getOrCreateCart(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/buyer/cart/items/:itemId
   */
  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { itemId } = req.params;

      await cartService.removeItem(userId, itemId);
      const cart = await cartService.getOrCreateCart(userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear cart
   * DELETE /api/buyer/cart
   */
  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      await cartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartController();
