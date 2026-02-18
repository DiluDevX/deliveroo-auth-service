import z from 'zod';
import {
  checkEmailRequestBodySchema,
  loginRequestBodySchema,
  refreshTokenResponseBodySchema,
  signUpRequestBodySchema,
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
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

export type SignUpRequestBodyDTO = z.infer<typeof signUpRequestBodySchema>;

export type SignUpResponseBodyDTO = {
  user: User | null;
};

export type ForgotPasswordRequestBodyDTO = {
  email: string;
};

export type ForgotPasswordResponseBodyDTO = {
  message: string;
};

export type ResetPasswordRequestBodyDTO = {
  token: string;
  password: string;
};

export type ResetPasswordResponseBodyDTO = {
  message: string;
};

export type RefreshTokenRequestBodyDTO = {
  refreshToken: string;
};

export type LogOutResponseBodyDTO = {
  message: string;
};

export type refreshTokenResponseBodyDTO = z.infer<typeof refreshTokenResponseBodySchema>;

export type LogOutRequestBodyDTO = z.infer<typeof refreshTokenResponseBodySchema>;

export type AuthenticationRequestBodyDTO = {
  accessToken: string;
  refreshToken: string;
};

export type AuthenticationResponseBodyDTO = {
  user: User;
};
