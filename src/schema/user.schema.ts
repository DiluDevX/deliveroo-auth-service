import z from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

export const createUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: z
    .string()
    .min(10, 'Phone number should be 10 digits')
    .max(10, 'Phone number cannot be more than 10 digits')
    .optional(),
  password: passwordSchema,
});

export const updateUserRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  email: emailSchema.optional(),
  phone: z
    .string()
    .min(10, 'Phone number should be 10 digits')
    .max(10, 'Phone number cannot be more than 10 digits')
    .optional(),
  password: passwordSchema.optional(),
});

export type UserUpdatePartiallyInput = z.infer<typeof updateUserRequestBodySchema>;
