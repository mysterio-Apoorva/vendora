import prisma from '../config/prisma';
import { Product, ProductStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';

export class InventoryService {
  /**
   * Create a new product for a vendor
   */
  async createProduct(vendorId: string, data: any): Promise<Product> {
    const slug = slugify(data.name, { lower: true }) + '-' + Math.random().toString(36).substring(2, 7);
    
    return prisma.product.create({
      data: {
        ...data,
        vendorId,
        slug,
        // Ensure price is handled as Decimal by Prisma
        price: new Prisma.Decimal(data.price),
        comparePrice: data.comparePrice ? new Prisma.Decimal(data.comparePrice) : null,
        costPrice: data.costPrice ? new Prisma.Decimal(data.costPrice) : null,
      },
    });
  }

  /**
   * Update an existing product
   */
  async updateProduct(productId: string, vendorId: string, data: any): Promise<Product> {
    // Ensure the product belongs to the vendor
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId },
    });

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name, { lower: true }) + '-' + Math.random().toString(36).substring(2, 7);
    }
    if (data.price) updateData.price = new Prisma.Decimal(data.price);
    if (data.comparePrice) updateData.comparePrice = new Prisma.Decimal(data.comparePrice);
    if (data.costPrice) updateData.costPrice = new Prisma.Decimal(data.costPrice);

    return prisma.product.update({
      where: { id: productId },
      data: updateData,
    });
  }

  /**
   * Delete a product (or archive it)
   */
  async deleteProduct(productId: string, vendorId: string): Promise<void> {
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId },
    });

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    // Instead of hard delete, we archive
    await prisma.product.update({
      where: { id: productId },
      data: { status: ProductStatus.ARCHIVED },
    });
  }

  /**
   * Get all products for a vendor with pagination
   */
  async getVendorProducts(vendorId: string, query: any) {
    const { page = 1, limit = 10, search, status, category } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      vendorId,
      status: { not: ProductStatus.ARCHIVED },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (category) where.categoryId = category;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get products for buyers with filters and search
   */
  async getCatalogProducts(query: any) {
    const { page = 1, limit = 12, search, category, minPrice, maxPrice, sort } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    if (category) {
      where.category = {
        OR: [
          { id: category },
          { slug: category },
          { parentId: category }, // Also include products from subcategories if needed
        ],
      };
    }

    if (minPrice || maxPrice) {
      where.price = {
        gte: minPrice ? new Prisma.Decimal(minPrice) : undefined,
        lte: maxPrice ? new Prisma.Decimal(maxPrice) : undefined,
      };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };
    if (sort === 'sales') orderBy = { salesCount: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: { select: { name: true, slug: true } },
          vendor: { select: { storeName: true, slug: true, rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get product detail by slug
   */
  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        vendor: true,
        variants: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
      },
    });

    if (!product || product.status === ProductStatus.ARCHIVED) {
      throw new Error('Product not found');
    }

    // Increment view count asynchronously
    prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error);

    return product;
  }

  // --- Variant Management ---

  /**
   * Add a variant to a product
   */
  async addVariant(productId: string, vendorId: string, data: any) {
    const product = await prisma.product.findFirst({
      where: { id: productId, vendorId },
    });

    if (!product) {
      throw new Error('Product not found or unauthorized');
    }

    return prisma.productVariant.create({
      data: {
        ...data,
        productId,
        price: new Prisma.Decimal(data.price),
      },
    });
  }

  /**
   * Update a product variant
   */
  async updateVariant(variantId: string, vendorId: string, data: any) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, product: { vendorId } },
    });

    if (!variant) {
      throw new Error('Variant not found or unauthorized');
    }

    const updateData = { ...data };
    if (data.price) updateData.price = new Prisma.Decimal(data.price);

    return prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
    });
  }

  /**
   * Delete a variant
   */
  async deleteVariant(variantId: string, vendorId: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, product: { vendorId } },
    });

    if (!variant) {
      throw new Error('Variant not found or unauthorized');
    }

    return prisma.productVariant.delete({
      where: { id: variantId },
    });
  }

  // --- Category Management ---

  /**
   * Create a new category (Admin only typically)
   */
  async createCategory(data: any) {
    const slug = slugify(data.name, { lower: true });
    return prisma.category.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, data: any) {
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name, { lower: true });
    }
    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * List all categories (Tree structure)
   */
  async getCategories(activeOnly = true) {
    const categories = await prisma.category.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // Build tree
    const categoryMap: any = {};
    categories.forEach(cat => categoryMap[cat.id] = { ...cat, children: [] });
    
    const tree: any[] = [];
    categories.forEach(cat => {
      if (cat.parentId && categoryMap[cat.parentId]) {
        categoryMap[cat.parentId].children.push(categoryMap[cat.id]);
      } else {
        tree.push(categoryMap[cat.id]);
      }
    });

    return tree;
  }
}

export default new InventoryService();
