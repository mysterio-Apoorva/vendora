import { Request, Response, NextFunction } from 'express';
import inventoryService from '../../../services/inventory.service';
import { createCategorySchema, updateCategorySchema } from '../../validators/product.validator';

export class CategoryController {
  /**
   * List all categories in tree structure
   * GET /api/buyer/categories
   */
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await inventoryService.getCategories(true);
      res.status(200).json({
        success: true,
        data: tree,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a category (Admin only)
   * POST /api/admin/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const category = await inventoryService.createCategory(validatedData);
      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a category (Admin only)
   * PATCH /api/admin/categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);
      const category = await inventoryService.updateCategory(id, validatedData);
      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
