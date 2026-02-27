import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

export const loginRequestBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpRequestBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  phone: z.string().optional(),
  password: passwordSchema,
});

export const checkEmailRequestBodySchema = z.object({
  email: emailSchema,
});

export const forgotPasswordRequestBodySchema = z.object({
  email: emailSchema,
});

export const refreshTokenRequestBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const logoutRequestBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const resetPasswordRequestBodySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export const verifyResetPasswordTokenRequestBodySchema = z.object({
  token: z.string().min(1, 'Token is required'),
});
