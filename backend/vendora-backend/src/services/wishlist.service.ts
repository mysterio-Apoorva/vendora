import prisma from '../config/prisma';

export class WishlistService {
  /**
   * Get user wishlist
   */
  async getWishlist(userId: string) {
    return prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            status: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(userId: string, productId: string) {
    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.wishlist.create({
      data: { userId, productId },
    });
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(userId: string, productId: string) {
    return prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }

  /**
   * Toggle wishlist item
   */
  async toggleWishlist(userId: string, productId: string) {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { added: false };
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return { added: true };
    }
  }
}

export default new WishlistService();
