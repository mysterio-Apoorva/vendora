"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutController = void 0;
const order_service_1 = __importDefault(require("../../../services/order.service"));
const order_validator_1 = require("../../validators/order.validator");
class CheckoutController {
    /**
     * Initiate checkout
     * POST /api/buyer/checkout
     */
    async initiateCheckout(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const validatedData = order_validator_1.checkoutSchema.parse(req.body);
            const result = await order_service_1.default.checkout(userId, validatedData);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Verify Payment
     * POST /api/buyer/checkout/verify
     */
    async verifyPayment(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const validatedData = order_validator_1.paymentVerificationSchema.parse(req.body);
            const order = await order_service_1.default.verifyPayment(userId, validatedData);
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: order,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get order history
     * GET /api/buyer/orders
     */
    async getMyOrders(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const orders = await order_service_1.default.getOrderHistory(userId);
            res.status(200).json({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get order detail
     * GET /api/buyer/orders/:id
     */
    async getOrderDetail(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { id } = req.params;
            const order = await order_service_1.default.getOrderDetail(userId, id);
            res.status(200).json({
                success: true,
                data: order,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cancel order
     * POST /api/buyer/orders/:id/cancel
     */
    async cancelOrder(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId)
                throw new Error('User not found');
            const { id } = req.params;
            const order = await order_service_1.default.cancelOrder(userId, id);
            res.status(200).json({
                success: true,
                message: 'Order cancelled successfully',
                data: order,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CheckoutController = CheckoutController;
exports.default = new CheckoutController();
