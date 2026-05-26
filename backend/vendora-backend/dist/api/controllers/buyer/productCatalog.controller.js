"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductCatalogController = void 0;
const inventory_service_1 = __importDefault(require("../../../services/inventory.service"));
const product_validator_1 = require("../../validators/product.validator");
class ProductCatalogController {
    /**
     * List products with filters and search
     * GET /api/buyer/products
     */
    async listProducts(req, res, next) {
        try {
            const validatedQuery = product_validator_1.productQuerySchema.parse(req.query);
            const result = await inventory_service_1.default.getCatalogProducts(validatedQuery);
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
     * Get product detail by slug
     * GET /api/buyer/products/:slug
     */
    async getProductDetail(req, res, next) {
        try {
            const { slug } = req.params;
            const product = await inventory_service_1.default.getProductBySlug(slug);
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
     * Get trending/featured products
     * GET /api/buyer/products/featured
     */
    async getFeaturedProducts(req, res, next) {
        try {
            const result = await inventory_service_1.default.getCatalogProducts({
                limit: 8,
                sort: 'sales',
            });
            res.status(200).json({
                success: true,
                data: result.products,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProductCatalogController = ProductCatalogController;
exports.default = new ProductCatalogController();
