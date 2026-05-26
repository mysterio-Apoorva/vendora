"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
class AdminService {
    /**
     * Vendor Management: Approve or Reject Vendor
     */
    async updateVendorStatus(adminId, vendorId, data) {
        const updateData = {
            status: data.status,
            approvedById: data.status === client_1.VendorStatus.APPROVED ? adminId : undefined,
            approvedAt: data.status === client_1.VendorStatus.APPROVED ? new Date() : undefined,
        };
        if (data.status === client_1.VendorStatus.REJECTED) {
            updateData.rejectionReason = data.reason;
        }
        else if (data.status === client_1.VendorStatus.SUSPENDED) {
            updateData.suspensionReason = data.reason;
        }
        if (data.commissionRate !== undefined) {
            updateData.commissionRate = new client_1.Prisma.Decimal(data.commissionRate);
        }
        return prisma_1.default.vendorProfile.update({
            where: { id: vendorId },
            data: updateData,
        });
    }
    /**
     * Fraud Management: Create Flag
     */
    async flagFraud(data) {
        return prisma_1.default.fraudFlag.create({
            data: {
                ...data,
                details: data.details || {},
            },
        });
    }
    /**
     * Fraud Management: Update Status
     */
    async updateFraudStatus(flagId, adminId, data) {
        return prisma_1.default.fraudFlag.update({
            where: { id: flagId },
            data: {
                status: data.status,
                resolution: data.resolution,
                assignedTo: adminId,
                resolvedAt: data.status === client_1.FraudStatus.RESOLVED ? new Date() : undefined,
            },
        });
    }
    /**
     * Commission Management: Upsert Commission
     */
    async setCommission(data) {
        return prisma_1.default.commission.create({
            data: {
                ...data,
                rate: new client_1.Prisma.Decimal(data.rate),
            },
        });
    }
    /**
     * Platform Analytics
     */
    async getPlatformStats() {
        const [totalRevenue, totalOrders, totalVendors, totalBuyers, recentFraudFlags] = await Promise.all([
            prisma_1.default.order.aggregate({
                _sum: { total: true },
                where: { paymentStatus: 'PAID' }
            }),
            prisma_1.default.order.count(),
            prisma_1.default.vendorProfile.count({ where: { status: 'APPROVED' } }),
            prisma_1.default.user.count({ where: { role: 'BUYER' } }),
            prisma_1.default.fraudFlag.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { name: true, email: true } } }
            })
        ]);
        // Monthly Growth (Orders)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newOrders = await prisma_1.default.order.count({
            where: { createdAt: { gte: thirtyDaysAgo } }
        });
        return {
            overview: {
                revenue: totalRevenue._sum.total || 0,
                orders: totalOrders,
                vendors: totalVendors,
                buyers: totalBuyers,
                growth30d: newOrders,
            },
            recentFraudFlags,
        };
    }
}
exports.AdminService = AdminService;
exports.default = new AdminService();
