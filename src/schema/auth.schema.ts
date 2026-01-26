import { z } from 'zod';

const emailSchema = z
  .string()
  .min(5, 'Email is required')
  .max(100, 'Email too long')
  .email('Invalid email format');

const createPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password too long');

const checkPasswordSchema = z.string().min(1, 'Password is required');

export const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: z.string().optional(),
  password: createPasswordSchema,
});

export const logInSchema = z.object({
  email: emailSchema,
  password: checkPasswordSchema,
});

export const checkEmailSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  token: z.string().min(1, 'Token is required'),
  password: createPasswordSchema,
});

export const validateTokenSchema = z.object({
  token: z.string().min(10, 'Token is required'),
});

export const refreshTokenSchema = z.string().min(1, 'Refresh token is required');

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LogInInput = z.infer<typeof logInSchema>;
export type CheckEmailInput = z.infer<typeof checkEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ValidateTokenInput = z.infer<typeof validateTokenSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
