"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionSchema = exports.updateFraudStatusSchema = exports.createFraudFlagSchema = exports.approveVendorSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.approveVendorSchema = zod_1.z.object({
    status: zod_1.z.enum([client_1.VendorStatus.APPROVED, client_1.VendorStatus.REJECTED, client_1.VendorStatus.SUSPENDED]),
    reason: zod_1.z.string().optional(),
    commissionRate: zod_1.z.number().min(0).max(100).optional(),
});
exports.createFraudFlagSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    type: zod_1.z.nativeEnum(client_1.FraudType),
    severity: zod_1.z.nativeEnum(client_1.FraudSeverity),
    details: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateFraudStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.FraudStatus),
    resolution: zod_1.z.string().optional(),
});
exports.commissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    type: zod_1.z.nativeEnum(client_1.CommissionType),
    rate: zod_1.z.number().min(0).max(100),
    categoryId: zod_1.z.string().uuid().optional(),
    vendorId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.boolean().default(true),
});
