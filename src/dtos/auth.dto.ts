import z from 'zod';
import {
  checkEmailRequestBodySchema,
  forgotPasswordRequestBodySchema,
  loginRequestBodySchema,
  logoutRequestBodySchema,
  refreshTokenRequestBodySchema,
  resetPasswordRequestBodySchema,
  signUpRequestBodySchema,
  verifyResetPasswordTokenRequestBodySchema,
} from '../schema/auth.schema';
import { User } from '@prisma/client';

export type CheckEmailRequestBodyDTO = z.infer<typeof checkEmailRequestBodySchema>;

export type CheckEmailResponseBodyDTO = {
  firstName: string;
  lastName: string;
  email: string;
};

export type LoginRequestBodyDTO = z.infer<typeof loginRequestBodySchema>;

export type LoginResponseBodyDTO = {
  accessToken: string;
  refreshToken: string;
};

export type SignUpRequestBodyDTO = z.infer<typeof signUpRequestBodySchema>;

export type SignUpResponseBodyDTO = Omit<User, 'password' | 'deletedAt'>;

export type ForgotPasswordRequestBodyDTO = z.infer<typeof forgotPasswordRequestBodySchema>;

export type RefreshTokenRequestBodyDTO = z.infer<typeof refreshTokenRequestBodySchema>;

export type RefreshTokenResponseBodyDTO = {
  accessToken: string;
  refreshToken: string;
};

export type LogoutRequestBodyDTO = z.infer<typeof logoutRequestBodySchema>;

export type VerifyResetPasswordTokenRequestBodyDTO = z.infer<
  typeof verifyResetPasswordTokenRequestBodySchema
>;

export type ResetPasswordRequestBodyDTO = z.infer<typeof resetPasswordRequestBodySchema>;
