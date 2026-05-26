import prisma from '../config/prisma';
import { VendorStatus, ItemStatus, Prisma, Role } from '@prisma/client';
import slugify from 'slugify';

export class VendorService {
  /**
   * Register a new vendor profile for an existing user
   */
  async registerVendor(userId: string, data: any) {
    const slug = slugify(data.storeName, { lower: true });

    // Check if store name is unique
    const existingStore = await prisma.vendorProfile.findUnique({
      where: { storeName: data.storeName },
    });

    if (existingStore) {
      throw new Error('Store name already exists');
    }

    return prisma.$transaction(async (tx) => {
      // Create profile
      const profile = await tx.vendorProfile.create({
        data: {
          ...data,
          userId,
          slug,
          status: VendorStatus.PENDING,
        },
      });

      // Update user role
      await tx.user.update({
        where: { id: userId },
        data: { role: Role.VENDOR },
      });

      return profile;
    });
  }

  /**
   * Get vendor dashboard statistics
   */
  async getDashboardStats(vendorId: string) {
    const [stats, recentOrders, lowStockCountResult] = await Promise.all([
      prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        select: {
          totalRevenue: true,
          totalOrders: true,
          totalProducts: true,
          rating: true,
          reviewCount: true,
        },
      }),
      prisma.orderItem.findMany({
        where: { vendorId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNumber: true, buyer: { select: { name: true } } } },
          product: { select: { name: true } },
        },
      }),
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as count 
        FROM products 
        WHERE vendor_id = ${vendorId} 
        AND stock <= low_stock_threshold 
        AND status = 'ACTIVE'
      `,
    ]);

    const lowStockCount = lowStockCountResult[0]?.count || 0;

    // Calculate monthly earnings (simple version)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyEarnings = await prisma.orderItem.aggregate({
      where: {
        vendorId,
        createdAt: { gte: startOfMonth },
        itemStatus: ItemStatus.DELIVERED,
      },
      _sum: {
        vendorPayout: true,
      },
    });

    return {
      stats,
      monthlyEarnings: monthlyEarnings._sum.vendorPayout || 0,
      recentOrders,
      lowStockCount,
    };
  }

  /**
   * List orders for a vendor
   */
  async getVendorOrders(vendorId: string, query: any) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderItemWhereInput = {
      vendorId,
    };

    if (status) where.itemStatus = status as ItemStatus;

    const [items, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { orderNumber: true, createdAt: true } },
          product: { select: { name: true, images: true } },
          variant: { select: { name: true } },
        },
      }),
      prisma.orderItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order item fulfillment status
   */
  async updateFulfillmentStatus(vendorId: string, orderItemId: string, data: { status: ItemStatus, trackingNumber?: string, courier?: string }) {
    const item = await prisma.orderItem.findFirst({
      where: { id: orderItemId, vendorId },
    });

    if (!item) {
      throw new Error('Order item not found or unauthorized');
    }

    const updateData: any = { itemStatus: data.status };
    if (data.status === ItemStatus.SHIPPED) {
      updateData.shippedAt = new Date();
      updateData.trackingNumber = data.trackingNumber;
      updateData.courier = data.courier;
    } else if (data.status === ItemStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    return prisma.orderItem.update({
      where: { id: orderItemId },
      data: updateData,
    });
  }

  /**
   * Get vendor profile details
   */
  async getVendorProfile(vendorId: string) {
    return prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
      },
    });
  }

  /**
   * Update vendor profile
   */
  async updateProfile(vendorId: string, data: any) {
    const updateData = { ...data };
    if (data.storeName) {
      updateData.slug = slugify(data.storeName, { lower: true });
    }

    return prisma.vendorProfile.update({
      where: { id: vendorId },
      data: updateData,
    });
  }
}

export default new VendorService();
