import { Prisma } from '@prisma/client';

/**
 * Format Decimal to number
 */
export const formatDecimal = (decimal: Prisma.Decimal | number | null): number => {
  if (!decimal) return 0;
  return Number(decimal);
};

/**
 * Generate a random SKU if not provided
 */
export const generateSKU = (prefix = 'VDR'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Simple delay helper
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
