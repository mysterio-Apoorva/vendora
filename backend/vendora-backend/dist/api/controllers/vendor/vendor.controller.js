"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorController = void 0;
const vendor_service_1 = __importDefault(require("../../../services/vendor.service"));
const vendor_validator_1 = require("../../validators/vendor.validator");
class VendorController {
    /**
     * Register as a vendor
     * POST /api/vendor/register
     */
    async register(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const validatedData = vendor_validator_1.registerVendorSchema.parse(req.body);
            const profile = await vendor_service_1.default.registerVendor(userId, validatedData);
            res.status(201).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get vendor dashboard stats
     * GET /api/vendor/dashboard
     */
    async getDashboard(req, res, next) {
        try {
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const stats = await vendor_service_1.default.getDashboardStats(vendorId);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get vendor profile
     * GET /api/vendor/profile
     */
    async getProfile(req, res, next) {
        try {
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const profile = await vendor_service_1.default.getVendorProfile(vendorId);
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
     * Update vendor profile
     * PATCH /api/vendor/profile
     */
    async updateProfile(req, res, next) {
        try {
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const validatedData = vendor_validator_1.updateVendorProfileSchema.parse(req.body);
            const profile = await vendor_service_1.default.updateProfile(vendorId, validatedData);
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VendorController = VendorController;
exports.default = new VendorController();
