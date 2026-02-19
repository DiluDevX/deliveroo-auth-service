import z from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

export const createUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: z.string().optional(),
  password: passwordSchema,
  role: z.enum(['user', 'platform_admin', 'restaurant_user']).default('user'),
});

export const updateUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  password: passwordSchema.optional(),
});

export type UserUpdatePartiallyInput = z.infer<typeof updateUserRequestBodySchema>;
