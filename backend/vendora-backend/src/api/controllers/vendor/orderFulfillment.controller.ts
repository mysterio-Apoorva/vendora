import { Request, Response, NextFunction } from 'express';
import vendorService from '../../../services/vendor.service';
import { updateOrderItemStatusSchema } from '../../validators/vendor.validator';
import { ItemStatus } from '@prisma/client';

export class OrderFulfillmentController {
  /**
   * List vendor order items
   * GET /api/vendor/orders
   */
  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const result = await vendorService.getVendorOrders(vendorId, req.query);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order item status (Fulfillment)
   * PATCH /api/vendor/orders/:itemId/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const { itemId } = req.params;
      const validatedData = updateOrderItemStatusSchema.parse(req.body);

      const updatedItem = await vendorService.updateFulfillmentStatus(
        vendorId,
        itemId,
        validatedData as any
      );

      res.status(200).json({
        success: true,
        data: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderFulfillmentController();
