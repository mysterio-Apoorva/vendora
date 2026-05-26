import { Request, Response, NextFunction } from 'express';
import inventoryService from '../../../services/inventory.service';
import { productQuerySchema } from '../../validators/product.validator';

export class ProductCatalogController {
  /**
   * List products with filters and search
   * GET /api/buyer/products
   */
  async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = productQuerySchema.parse(req.query);
      const result = await inventoryService.getCatalogProducts(validatedQuery);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product detail by slug
   * GET /api/buyer/products/:slug
   */
  async getProductDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await inventoryService.getProductBySlug(slug);

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get trending/featured products
   * GET /api/buyer/products/featured
   */
  async getFeaturedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await inventoryService.getCatalogProducts({
        limit: 8,
        sort: 'sales',
      });

      res.status(200).json({
        success: true,
        data: result.products,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductCatalogController();
