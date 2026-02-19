import { z } from 'zod';

export const idRequestPathParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const commonRequestQueryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const emailSchema = z
  .string()
  .min(5, 'Email is required')
  .max(100, 'Email too long')
  .email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password too long');
