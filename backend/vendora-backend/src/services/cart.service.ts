import prisma from '../config/prisma';
import { Prisma, ProductStatus } from '@prisma/client';

export class CartService {
  /**
   * Get or create a cart for a user
   */
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: true,
                status: true,
                vendorId: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      }) as any;
    }

    return this.calculateTotals(cart);
  }

  /**
   * Add an item to the cart
   */
  async addItem(userId: string, data: { productId: string; variantId?: string; quantity: number }) {
    const cart = await this.getOrCreateCart(userId);
    
    // Check product existence and price
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      select: { price: true, status: true },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      throw new Error('Product not available');
    }

    let priceSnapshot = product.price;

    // Check variant if provided
    if (data.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: data.variantId, productId: data.productId },
        select: { price: true, isActive: true },
      });

      if (!variant || !variant.isActive) {
        throw new Error('Product variant not available');
      }
      priceSnapshot = variant.price;
    }

    // Upsert cart item
    await prisma.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null as any,
        },
      },
      update: {
        quantity: { increment: data.quantity },
        priceSnapshot,
      },
      create: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        priceSnapshot,
      },
    });

    return this.getOrCreateCart(userId);
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    return prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  /**
   * Internal helper to calculate cart totals
   */
  private calculateTotals(cart: any) {
    let subtotal = new Prisma.Decimal(0);
    
    const items = cart.items.map((item: any) => {
      const price = item.variant ? item.variant.price : item.product.price;
      const total = new Prisma.Decimal(price).mul(item.quantity);
      subtotal = subtotal.add(total);
      
      return {
        ...item,
        price,
        total,
      };
    });

    return {
      ...cart,
      items,
      subtotal,
      total: subtotal, // For now, total = subtotal (no tax/shipping yet)
    };
  }
}

export default new CartService();
