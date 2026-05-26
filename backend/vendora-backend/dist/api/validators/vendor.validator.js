"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderItemStatusSchema = exports.updateVendorProfileSchema = exports.registerVendorSchema = void 0;
const zod_1 = require("zod");
exports.registerVendorSchema = zod_1.z.object({
    storeName: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().max(1000).optional(),
    gstin: zod_1.z.string().length(15).optional(),
    pan: zod_1.z.string().length(10).optional(),
    bankAccount: zod_1.z.string().min(9).max(18).optional(),
    ifscCode: zod_1.z.string().length(11).optional(),
    upiId: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().url().optional(),
    bannerUrl: zod_1.z.string().url().optional(),
});
exports.updateVendorProfileSchema = exports.registerVendorSchema.partial();
exports.updateOrderItemStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    trackingNumber: zod_1.z.string().optional(),
    courier: zod_1.z.string().optional(),
});
