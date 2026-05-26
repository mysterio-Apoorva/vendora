"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentVerificationSchema = exports.checkoutSchema = exports.wishlistSchema = exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    variantId: zod_1.z.string().uuid().optional(),
    quantity: zod_1.z.number().int().positive().default(1),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().int().positive(),
});
exports.wishlistSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
});
exports.checkoutSchema = zod_1.z.object({
    addressId: zod_1.z.string().uuid(),
    couponCode: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.enum(['razorpay', 'cod']).default('razorpay'),
});
exports.paymentVerificationSchema = zod_1.z.object({
    razorpayOrderId: zod_1.z.string(),
    razorpayPaymentId: zod_1.z.string(),
    razorpaySignature: zod_1.z.string(),
});
