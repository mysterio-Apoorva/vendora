"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderFulfillmentController = void 0;
const vendor_service_1 = __importDefault(require("../../../services/vendor.service"));
const vendor_validator_1 = require("../../validators/vendor.validator");
class OrderFulfillmentController {
    /**
     * List vendor order items
     * GET /api/vendor/orders
     */
    async getMyOrders(req, res, next) {
        try {
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const result = await vendor_service_1.default.getVendorOrders(vendorId, req.query);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update order item status (Fulfillment)
     * PATCH /api/vendor/orders/:itemId/status
     */
    async updateStatus(req, res, next) {
        try {
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const { itemId } = req.params;
            const validatedData = vendor_validator_1.updateOrderItemStatusSchema.parse(req.body);
            const updatedItem = await vendor_service_1.default.updateFulfillmentStatus(vendorId, itemId, validatedData);
            res.status(200).json({
                success: true,
                data: updatedItem,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.OrderFulfillmentController = OrderFulfillmentController;
exports.default = new OrderFulfillmentController();
