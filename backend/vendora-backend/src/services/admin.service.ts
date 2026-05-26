import prisma from '../config/prisma';
import { VendorStatus, Prisma, FraudStatus, ItemStatus } from '@prisma/client';

export class AdminService {
  /**
   * Vendor Management: Approve or Reject Vendor
   */
  async updateVendorStatus(adminId: string, vendorId: string, data: { status: VendorStatus; reason?: string; commissionRate?: number }) {
    const updateData: any = {
      status: data.status,
      approvedById: data.status === VendorStatus.APPROVED ? adminId : undefined,
      approvedAt: data.status === VendorStatus.APPROVED ? new Date() : undefined,
    };

    if (data.status === VendorStatus.REJECTED) {
      updateData.rejectionReason = data.reason;
    } else if (data.status === VendorStatus.SUSPENDED) {
      updateData.suspensionReason = data.reason;
    }

    if (data.commissionRate !== undefined) {
      updateData.commissionRate = new Prisma.Decimal(data.commissionRate);
    }

    return prisma.vendorProfile.update({
      where: { id: vendorId },
      data: updateData,
    });
  }

  /**
   * Fraud Management: Create Flag
   */
  async flagFraud(data: any) {
    return prisma.fraudFlag.create({
      data: {
        ...data,
        details: data.details || {},
      },
    });
  }

  /**
   * Fraud Management: Update Status
   */
  async updateFraudStatus(flagId: string, adminId: string, data: { status: FraudStatus; resolution?: string }) {
    return prisma.fraudFlag.update({
      where: { id: flagId },
      data: {
        status: data.status,
        resolution: data.resolution,
        assignedTo: adminId,
        resolvedAt: data.status === FraudStatus.RESOLVED ? new Date() : undefined,
      },
    });
  }

  /**
   * Commission Management: Upsert Commission
   */
  async setCommission(data: any) {
    return prisma.commission.create({
      data: {
        ...data,
        rate: new Prisma.Decimal(data.rate),
      },
    });
  }

  /**
   * Platform Analytics
   */
  async getPlatformStats() {
    const [
      totalRevenue,
      totalOrders,
      totalVendors,
      totalBuyers,
      recentFraudFlags
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID' }
      }),
      prisma.order.count(),
      prisma.vendorProfile.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { role: 'BUYER' } }),
      prisma.fraudFlag.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } }
      })
    ]);

    // Monthly Growth (Orders)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newOrders = await prisma.order.count({
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

export default new AdminService();
