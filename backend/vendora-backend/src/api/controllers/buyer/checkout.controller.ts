import { Request, Response, NextFunction } from 'express';
import orderService from '../../../services/order.service';
import { checkoutSchema, paymentVerificationSchema } from '../../validators/order.validator';

export class CheckoutController {
  /**
   * Initiate checkout
   * POST /api/buyer/checkout
   */
  async initiateCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const validatedData = checkoutSchema.parse(req.body);

      const result = await orderService.checkout(userId, validatedData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Payment
   * POST /api/buyer/checkout/verify
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const validatedData = paymentVerificationSchema.parse(req.body);

      const order = await orderService.verifyPayment(userId, validatedData);

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order history
   * GET /api/buyer/orders
   */
  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const orders = await orderService.getOrderHistory(userId);

      res.status(200).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order detail
   * GET /api/buyer/orders/:id
   */
  async getOrderDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { id } = req.params;

      const order = await orderService.getOrderDetail(userId, id);

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel order
   * POST /api/buyer/orders/:id/cancel
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');
      const { id } = req.params;

      const order = await orderService.cancelOrder(userId, id);

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CheckoutController();
