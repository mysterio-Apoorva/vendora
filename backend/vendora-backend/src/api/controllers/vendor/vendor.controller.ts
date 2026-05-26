import { Request, Response, NextFunction } from 'express';
import vendorService from '../../../services/vendor.service';
import { registerVendorSchema, updateVendorProfileSchema } from '../../validators/vendor.validator';

export class VendorController {
  /**
   * Register as a vendor
   * POST /api/vendor/register
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error('User not found');

      const validatedData = registerVendorSchema.parse(req.body);
      const profile = await vendorService.registerVendor(userId, validatedData);

      res.status(201).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor dashboard stats
   * GET /api/vendor/dashboard
   */
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const stats = await vendorService.getDashboardStats(vendorId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get vendor profile
   * GET /api/vendor/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const profile = await vendorService.getVendorProfile(vendorId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update vendor profile
   * PATCH /api/vendor/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const validatedData = updateVendorProfileSchema.parse(req.body);
      const profile = await vendorService.updateProfile(vendorId, validatedData);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new VendorController();
