"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = __importDefault(require("../../../services/admin.service"));
const admin_validator_1 = require("../../validators/admin.validator");
class AdminController {
    /**
     * Vendor Approval/Rejection
     * PATCH /api/admin/vendors/:id/status
     */
    async updateVendorStatus(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.id;
            if (!adminId)
                throw new Error('Admin not authenticated');
            const validatedData = admin_validator_1.approveVendorSchema.parse(req.body);
            const profile = await admin_service_1.default.updateVendorStatus(adminId, id, validatedData);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Flag Fraudulent Activity
     * POST /api/admin/fraud
     */
    async flagFraud(req, res, next) {
        try {
            const validatedData = admin_validator_1.createFraudFlagSchema.parse(req.body);
            const flag = await admin_service_1.default.flagFraud(validatedData);
            res.status(201).json({
                success: true,
                data: flag,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update Fraud Flag Status
     * PATCH /api/admin/fraud/:id
     */
    async updateFraudStatus(req, res, next) {
        try {
            const { id } = req.params;
            const adminId = req.user?.id;
            if (!adminId)
                throw new Error('Admin not authenticated');
            const validatedData = admin_validator_1.updateFraudStatusSchema.parse(req.body);
            const flag = await admin_service_1.default.updateFraudStatus(id, adminId, validatedData);
            res.status(200).json({
                success: true,
                data: flag,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Commission Management
     * POST /api/admin/commissions
     */
    async setCommission(req, res, next) {
        try {
            const validatedData = admin_validator_1.commissionSchema.parse(req.body);
            const commission = await admin_service_1.default.setCommission(validatedData);
            res.status(201).json({
                success: true,
                data: commission,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Dashboard Analytics
     * GET /api/admin/stats
     */
    async getStats(req, res, next) {
        try {
            const stats = await admin_service_1.default.getPlatformStats();
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
exports.default = new AdminController();
