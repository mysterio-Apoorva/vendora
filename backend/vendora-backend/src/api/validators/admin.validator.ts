import { z } from 'zod';
import { VendorStatus, FraudType, FraudSeverity, FraudStatus, CommissionType } from '@prisma/client';

export const approveVendorSchema = z.object({
  status: z.enum([VendorStatus.APPROVED, VendorStatus.REJECTED, VendorStatus.SUSPENDED]),
  reason: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
});

export const createFraudFlagSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(FraudType),
  severity: z.nativeEnum(FraudSeverity),
  details: z.record(z.any()).optional(),
});

export const updateFraudStatusSchema = z.object({
  status: z.nativeEnum(FraudStatus),
  resolution: z.string().optional(),
});

export const commissionSchema = z.object({
  name: z.string().min(3),
  type: z.nativeEnum(CommissionType),
  rate: z.number().min(0).max(100),
  categoryId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
});
