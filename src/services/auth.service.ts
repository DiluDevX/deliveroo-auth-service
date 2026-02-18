import { prisma } from '../config/database';
import { comparePasswords, hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, hashToken, verifyToken } from '../utils/jwt';
import {
  AdminLogInInput,
  RefreshTokenInput,
  RefreshTokenOutput,
  SignUpInput,
} from '../schema/auth.schema';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import crypto from 'node:crypto';
import { IUser } from '../types/global';
import axios from 'axios';
import { CommonResponseDTO } from '../dtos/common.dto';
import {
  AuthenticationResponseBodyDTO,
  ForgotPasswordResponseBodyDTO,
  LoginResponseBodyDTO,
  LogOutResponseBodyDTO,
  SignUpResponseBodyDTO,
} from '../dtos/auth.dto';

export const excludePassword = (user: IUser) => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const checkEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { exists: false };
  }

  return {
    exists: true,
    user: user,
  };
};

export const signup = async (
  data: SignUpInput
): Promise<CommonResponseDTO<SignUpResponseBodyDTO>> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('User already exists', 'USER_EXISTS');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
    },
  });

  if (data.role === 'restaurant_user' && data.restaurantId) {
    await prisma.restaurantUser.create({
      data: {
        role: 'employee',
        restaurantId: data.restaurantId,
        userId: user.id,
      },
    });
  }

  return {
    success: true,
    message: 'User created successfully',
    data: {
      user: null,
    },
  };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<CommonResponseDTO<LoginResponseBodyDTO>> => {
  const foundUser = await checkEmail(email);

  if (!foundUser.exists || !foundUser.user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await comparePasswords(password, foundUser.user?.password || '');

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const accessToken = generateAccessToken({
    userId: foundUser.user.id,
    email: foundUser.user.email,
    role: foundUser.user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: foundUser.user.id,
    email: foundUser.user.email,
    role: foundUser.user.role,
  });

  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: foundUser.user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    data: {
      user: excludePassword(foundUser.user),
      accessToken,
      refreshToken,
    },
    success: true,
    message: 'Login successful',
  };
};

export const adminLogin = async (data: AdminLogInInput) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await comparePasswords(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: excludePassword(user),
    accessToken,
    refreshToken,
  };
};

export const updateUserPartially = async (userId: string, data: Partial<IUser>) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (data.email && data.email !== user.email) {
    const emailTaken = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailTaken) {
      throw new ConflictError('Email is already in use', 'EMAIL_IN_USE');
    }
  }

  const updatedData: Partial<IUser> = {};

  if (data.firstName !== undefined) updatedData.firstName = data.firstName;
  if (data.lastName !== undefined) updatedData.lastName = data.lastName;
  if (data.email !== undefined) updatedData.email = data.email;
  if (data.phone !== undefined) updatedData.phone = data.phone;
  if (data.role !== undefined) updatedData.role = data.role;

  if (data.password) {
    updatedData.password = await hashPassword(data.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });

  return excludePassword(updatedUser);
};

export const logOut = async (
  refreshToken: string
): Promise<CommonResponseDTO<LogOutResponseBodyDTO>> => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
  return { success: true, message: 'Logged out successfully' };
};

export const refresh = async (
  data: RefreshTokenInput
): Promise<CommonResponseDTO<RefreshTokenOutput>> => {
  const payload = verifyToken(data);

  const hashedRefreshToken = hashToken(data);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedRefreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return {
      success: false,
      message: 'Refresh token is invalid',
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });
  if (!user) {
    return {
      success: false,
      message: 'User not found',
    };
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  const newHashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.delete({
    where: { token: hashedRefreshToken },
  });

  await prisma.refreshToken.create({
    data: {
      token: newHashedRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { message: 'Refresh token updated', success: true, data: { accessToken, refreshToken } };
};

export const forgotPassword = async (
  email: string
): Promise<CommonResponseDTO<ForgotPasswordResponseBodyDTO>> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { message: 'If the email exists, a reset link will be sent', success: false };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(token);

  await prisma.passwordReset.create({
    data: {
      token: hashedToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await sendResetPasswordEmail(token, email);

  return { message: 'Reset link sent', success: true };
};

export const sendResetPasswordEmail = async (token: string, email: string) => {
  try {
    if (typeof fetch !== 'function') {
      console.error(
        '[sendResetPasswordEmail] Global fetch is not available. Use Node 18+ or add a fetch polyfill.'
      );
      return { message: 'Something went wrong.' };
    }
    const mailServiceUrl = process.env.MAIL_SERVICE_URL;
    if (!mailServiceUrl) {
      console.error('[sendResetPasswordEmail] MAIL_SERVICE_URL is not set');
      return { message: 'Something went wrong.' };
    }
    const url = `${process.env.MAIL_SERVICE_URL}/api/mail/password-reset`;
    const res = await axios.post(url, {
      token,
      email,
    });
    if (res.status !== 200) {
      console.error(
        `[sendResetPasswordEmail] Failed to send email: ${res.status} ${res.statusText}`
      );
      return { message: 'Something went wrong.' };
    }
    return { message: 'If the email exists, a reset link will be sent' };
  } catch (err) {
    console.error('[sendResetPasswordEmail] Error:', err);
    return { message: 'Something went wrong.' };
  }
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = hashToken(token);

  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token: hashedToken },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new BadRequestError('Invalid email or reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.passwordReset.delete({
    where: { token: hashedToken },
  });

  return { message: 'Password reset successful' };
};
export const validateAccessToken = async (
  token: string
): Promise<CommonResponseDTO<AuthenticationResponseBodyDTO>> => {
  try {
    const payload = verifyToken(token);

    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) {
      return { message: 'Unauthorized', success: false };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return { message: 'Unauthorized', success: false };
    }
    return { message: 'Authorized', success: true, data: { user } };
  } catch {
    return { message: 'Unauthorized', success: false };
  }
};
