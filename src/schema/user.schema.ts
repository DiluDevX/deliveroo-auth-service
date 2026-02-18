import z from 'zod';
import { emailSchema, createPasswordSchema } from './auth.schema';

export const createUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: z.string().optional(),
  password: createPasswordSchema,
  role: z.enum(['user', 'platform_admin', 'restaurant_user']).default('user'),
});

export const userUpdatePartiallyRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  password: createPasswordSchema.optional(),
  role: z.enum(['user', 'platform_admin', 'restaurant_user']).default('user').optional(),
});

export const userUpdatePartiallyRequestParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const deleteUserRequestParamsSchema = z.object({
  id: z.string().min(1, 'UserId is required'),
});

export const getUserRequestParamsSchema = z.object({
  id: z.string().min(1, 'UserId is required'),
});

export type UserUpdatePartiallyInput = z.infer<typeof userUpdatePartiallyRequestBodySchema>;
