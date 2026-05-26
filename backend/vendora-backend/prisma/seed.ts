import { PrismaClient, Role, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vendora.com' },
    update: {},
    create: {
      email: 'admin@vendora.com',
      clerkId: 'admin_1',
      name: 'Platform Admin',
      role: Role.ADMIN,
    },
  });

  // Create Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      isActive: true,
    },
  });

  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      parentId: electronics.id,
      isActive: true,
    },
  });

  // Create Vendor
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@vendora.com' },
    update: {},
    create: {
      email: 'vendor@vendora.com',
      clerkId: 'vendor_1',
      name: 'John Vendor',
      role: Role.VENDOR,
    },
  });

  const vendorProfile = await prisma.vendorProfile.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      storeName: 'Tech Haven',
      slug: 'tech-haven',
      status: 'APPROVED',
    },
  });

  // Create Product
  await prisma.product.upsert({
    where: { slug: 'macbook-pro-m3' },
    update: {},
    create: {
      vendorId: vendorProfile.id,
      categoryId: laptops.id,
      name: 'MacBook Pro M3',
      slug: 'macbook-pro-m3',
      description: 'The latest MacBook Pro with M3 chip.',
      price: 159900,
      sku: 'MBP-M3-001',
      stock: 10,
      status: ProductStatus.ACTIVE,
      isFeatured: true,
    },
  });

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
