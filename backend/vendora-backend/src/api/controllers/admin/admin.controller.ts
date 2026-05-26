import { Request, Response, NextFunction } from 'express';
import adminService from '../../../services/admin.service';
import { approveVendorSchema, createFraudFlagSchema, updateFraudStatusSchema, commissionSchema } from '../../validators/admin.validator';

export class AdminController {
  /**
   * Vendor Approval/Rejection
   * PATCH /api/admin/vendors/:id/status
   */
  async updateVendorStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      if (!adminId) throw new Error('Admin not authenticated');

      const validatedData = approveVendorSchema.parse(req.body);
      const profile = await adminService.updateVendorStatus(adminId, id, validatedData);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Flag Fraudulent Activity
   * POST /api/admin/fraud
   */
  async flagFraud(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createFraudFlagSchema.parse(req.body);
      const flag = await adminService.flagFraud(validatedData);

      res.status(201).json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Fraud Flag Status
   * PATCH /api/admin/fraud/:id
   */
  async updateFraudStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      if (!adminId) throw new Error('Admin not authenticated');

      const validatedData = updateFraudStatusSchema.parse(req.body);
      const flag = await adminService.updateFraudStatus(id, adminId, validatedData);

      res.status(200).json({
        success: true,
        data: flag,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Commission Management
   * POST /api/admin/commissions
   */
  async setCommission(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = commissionSchema.parse(req.body);
      const commission = await adminService.setCommission(validatedData);

      res.status(201).json({
        success: true,
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dashboard Analytics
   * GET /api/admin/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getPlatformStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
