"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = __importDefault(require("../config/env"));
const cart_service_1 = __importDefault(require("./cart.service"));
const razorpay = new razorpay_1.default({
    key_id: env_1.default.RAZORPAY_KEY_ID || '',
    key_secret: env_1.default.RAZORPAY_KEY_SECRET || '',
});
class OrderService {
    /**
     * Initialize checkout: validate cart and create Razorpay order if needed
     */
    async checkout(userId, data) {
        const cart = await cart_service_1.default.getOrCreateCart(userId);
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
        const order = await prisma_1.default.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    orderNumber,
                    buyerId: userId,
                    addressId: data.addressId,
                    subtotal: cart.subtotal,
                    total: cart.total,
                    status: client_1.OrderStatus.PENDING,
                    paymentStatus: client_1.PaymentStatus.PENDING,
                    paymentMethod: data.paymentMethod,
                    razorpayOrderId: razorpayOrder?.id,
                    notes: data.notes,
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            vendorId: item.product.vendorId,
                            variantId: item.variantId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            totalPrice: item.total,
                            nameSnapshot: item.product.name,
                            skuSnapshot: item.product.sku,
                            imageSnapshot: item.variant?.imageUrl || item.product.images[0]?.url,
                            // Platform default commission for now
                            commissionRate: 10,
                            commissionAmount: new client_1.Prisma.Decimal(item.total).mul(0.1),
                            vendorPayout: new client_1.Prisma.Decimal(item.total).mul(0.9),
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
    async verifyPayment(userId, data) {
        const secret = env_1.default.RAZORPAY_KEY_SECRET || '';
        const body = data.razorpayOrderId + "|" + data.razorpayPaymentId;
        const expectedSignature = crypto_1.default
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        if (expectedSignature !== data.razorpaySignature) {
            throw new Error('Invalid payment signature');
        }
        // Update order status
        return prisma_1.default.$transaction(async (tx) => {
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
                    paymentStatus: client_1.PaymentStatus.PAID,
                    status: client_1.OrderStatus.CONFIRMED,
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
                }
                else {
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
    async getOrderHistory(userId) {
        return prisma_1.default.order.findMany({
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
    async getOrderDetail(userId, orderId) {
        const order = await prisma_1.default.order.findFirst({
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
        if (!order)
            throw new Error('Order not found');
        return order;
    }
    /**
     * Cancel order (if still pending/confirmed)
     */
    async cancelOrder(userId, orderId) {
        const order = await prisma_1.default.order.findFirst({
            where: { id: orderId, buyerId: userId },
        });
        if (!order)
            throw new Error('Order not found');
        if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
            throw new Error('Order cannot be cancelled at this stage');
        }
        return prisma_1.default.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.CANCELLED,
                cancelledAt: new Date(),
            },
        });
    }
}
exports.OrderService = OrderService;
exports.default = new OrderService();
