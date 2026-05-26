import prisma from '../config/prisma';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import env from '../config/env';
import cartService from './cart.service';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID || '',
  key_secret: env.RAZORPAY_KEY_SECRET || '',
});

export class OrderService {
  /**
   * Initialize checkout: validate cart and create Razorpay order if needed
   */
  async checkout(userId: string, data: { addressId: string; paymentMethod: string; notes?: string }) {
    const cart = await cartService.getOrCreateCart(userId);
    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Generate unique order number
    const orderNumber = `VDR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Calculate total in paise for Razorpay
    const amountInPaise = Math.round(Number(cart.total) * 100);

    let razorpayOrder = null;
    if (data.paymentMethod === 'razorpay') {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderNumber,
      });
    }

    // Create Order in DB (Status: PENDING)
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerId: userId,
          addressId: data.addressId,
          subtotal: cart.subtotal,
          total: cart.total,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          paymentMethod: data.paymentMethod,
          razorpayOrderId: razorpayOrder?.id,
          notes: data.notes,
          items: {
            create: cart.items.map((item: any) => ({
              productId: item.productId,
              vendorId: item.product.vendorId,
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.price,
              totalPrice: item.total,
              nameSnapshot: item.product.name,
              skuSnapshot: item.product.sku,
              imageSnapshot: item.variant?.imageUrl || (item.product.images as any)[0]?.url,
              // Platform default commission for now
              commissionRate: 10,
              commissionAmount: new Prisma.Decimal(item.total).mul(0.1),
              vendorPayout: new Prisma.Decimal(item.total).mul(0.9),
            })),
          },
        },
        include: { items: true },
      });

      // If COD, we can clear cart immediately. If Razorpay, we wait for verification.
      if (data.paymentMethod === 'cod') {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return newOrder;
    });

    return {
      order,
      razorpayOrder,
    };
  }

  /**
   * Verify Razorpay Payment
   */
  async verifyPayment(userId: string, data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    const secret = env.RAZORPAY_KEY_SECRET || '';
    const body = data.razorpayOrderId + "|" + data.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new Error('Invalid payment signature');
    }

    // Update order status
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { razorpayOrderId: data.razorpayOrderId },
        include: { items: true },
      });

      if (!order || order.buyerId !== userId) {
        throw new Error('Order not found');
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.CONFIRMED,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpaySignature: data.razorpaySignature,
          confirmedAt: new Date(),
        },
      });

      // Clear buyer's cart after successful payment
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // Update product stock and sales count
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { 
              stock: { decrement: item.quantity },
              salesCount: { increment: item.quantity }
            },
          });
        }
      }

      return updatedOrder;
    });
  }

  /**
   * Get user order history
   */
  async getOrderHistory(userId: string) {
    return prisma.order.findMany({
      where: { buyerId: userId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get order details
   */
  async getOrderDetail(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
      include: {
        items: {
          include: {
            product: { select: { name: true, slug: true, images: true } },
            vendor: { select: { storeName: true, slug: true } }
          }
        },
        address: true,
      },
    });

    if (!order) throw new Error('Order not found');
    return order;
  }

  /**
   * Cancel order (if still pending/confirmed)
   */
  async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
    });

    if (!order) throw new Error('Order not found');
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }
}

export default new OrderService();
