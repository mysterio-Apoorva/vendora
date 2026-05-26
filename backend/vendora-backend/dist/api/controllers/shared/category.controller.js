"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const inventory_service_1 = __importDefault(require("../../../services/inventory.service"));
const product_validator_1 = require("../../validators/product.validator");
class CategoryController {
    /**
     * List all categories in tree structure
     * GET /api/buyer/categories
     */
    async listCategories(req, res, next) {
        try {
            const tree = await inventory_service_1.default.getCategories(true);
            res.status(200).json({
                success: true,
                data: tree,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create a category (Admin only)
     * POST /api/admin/categories
     */
    async createCategory(req, res, next) {
        try {
            const validatedData = product_validator_1.createCategorySchema.parse(req.body);
            const category = await inventory_service_1.default.createCategory(validatedData);
            res.status(201).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update a category (Admin only)
     * PATCH /api/admin/categories/:id
     */
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const validatedData = product_validator_1.updateCategorySchema.parse(req.body);
            const category = await inventory_service_1.default.updateCategory(id, validatedData);
            res.status(200).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CategoryController = CategoryController;
exports.default = new CategoryController();
