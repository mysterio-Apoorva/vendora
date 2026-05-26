import { Request, Response, NextFunction } from 'express';
import inventoryService from '../../../services/inventory.service';
import { createProductSchema, updateProductSchema, createVariantSchema, updateVariantSchema } from '../../validators/product.validator';

export class InventoryController {
  /**
   * Create a new product
   * POST /api/vendor/products
   */
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const vendorId = req.user?.vendorId; 
      
      if (!vendorId) throw new Error('Vendor profile not found');
      
      const product = await inventoryService.createProduct(vendorId, validatedData);
      
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a product
   * PATCH /api/vendor/products/:id
   */
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateProductSchema.parse(req.body);
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const product = await inventoryService.updateProduct(id, vendorId, validatedData);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete (archive) a product
   * DELETE /api/vendor/products/:id
   */
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      await inventoryService.deleteProduct(id, vendorId);

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List vendor products
   * GET /api/vendor/products
   */
  async getMyProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');
      const result = await inventoryService.getVendorProducts(vendorId, req.query);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Variant Controllers ---

  /**
   * Add a variant to a product
   * POST /api/vendor/products/:productId/variants
   */
  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const validatedData = createVariantSchema.parse(req.body);
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const variant = await inventoryService.addVariant(productId, vendorId, validatedData);

      res.status(201).json({
        success: true,
        data: variant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a variant
   * PATCH /api/vendor/variants/:id
   */
  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateVariantSchema.parse(req.body);
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      const variant = await inventoryService.updateVariant(id, vendorId, validatedData);

      res.status(200).json({
        success: true,
        data: variant,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a variant
   * DELETE /api/vendor/variants/:id
   */
  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const vendorId = req.user?.vendorId;
      if (!vendorId) throw new Error('Vendor profile not found');

      await inventoryService.deleteVariant(id, vendorId);

      res.status(200).json({
        success: true,
        message: 'Variant deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
