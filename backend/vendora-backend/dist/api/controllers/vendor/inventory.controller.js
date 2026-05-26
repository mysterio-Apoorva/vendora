"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = __importDefault(require("../../../services/inventory.service"));
const product_validator_1 = require("../../validators/product.validator");
class InventoryController {
    /**
     * Create a new product
     * POST /api/vendor/products
     */
    async createProduct(req, res, next) {
        try {
            const validatedData = product_validator_1.createProductSchema.parse(req.body);
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const product = await inventory_service_1.default.createProduct(vendorId, validatedData);
            res.status(201).json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update a product
     * PATCH /api/vendor/products/:id
     */
    async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = product_validator_1.updateProductSchema.parse(req.body);
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const product = await inventory_service_1.default.updateProduct(id, vendorId, validatedData);
            res.status(200).json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete (archive) a product
     * DELETE /api/vendor/products/:id
     */
    async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            await inventory_service_1.default.deleteProduct(id, vendorId);
            res.status(200).json({
                success: true,
                message: 'Product deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List vendor products
     * GET /api/vendor/products
     */
    async getMyProducts(req, res, next) {
        try {
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const result = await inventory_service_1.default.getVendorProducts(vendorId, req.query);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    // --- Variant Controllers ---
    /**
     * Add a variant to a product
     * POST /api/vendor/products/:productId/variants
     */
    async addVariant(req, res, next) {
        try {
            const { productId } = req.params;
            const validatedData = product_validator_1.createVariantSchema.parse(req.body);
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const variant = await inventory_service_1.default.addVariant(productId, vendorId, validatedData);
            res.status(201).json({
                success: true,
                data: variant,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update a variant
     * PATCH /api/vendor/variants/:id
     */
    async updateVariant(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = product_validator_1.updateVariantSchema.parse(req.body);
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            const variant = await inventory_service_1.default.updateVariant(id, vendorId, validatedData);
            res.status(200).json({
                success: true,
                data: variant,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a variant
     * DELETE /api/vendor/variants/:id
     */
    async deleteVariant(req, res, next) {
        try {
            const { id } = req.params;
            const vendorId = req.user?.vendorId;
            if (!vendorId)
                throw new Error('Vendor profile not found');
            await inventory_service_1.default.deleteVariant(id, vendorId);
            res.status(200).json({
                success: true,
                message: 'Variant deleted successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InventoryController = InventoryController;
exports.default = new InventoryController();
