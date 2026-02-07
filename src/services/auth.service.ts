import { prisma } from '../config/database';
import { comparePasswords, hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, hashToken, verifyToken } from '../utils/jwt';
import { AdminLogInInput, LogInInput, RefreshTokenInput, SignUpInput } from '../schema/auth.schema';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import crypto from 'node:crypto';
import { User } from '../types/global';
import axios from 'axios';

const excludePassword = (user: User) => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const getAll = async () => {
  const users = await prisma.user.findMany();
  return users.map(excludePassword);
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
    user: excludePassword(user),
  };
};

export const signup = async (data: SignUpInput) => {
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
      restaurantId: data.role === 'restaurant_admin' ? data.restaurantId : null,
    },
  });

  return {
    user: excludePassword(user),
    message: 'User created successfully',
  };
};

export const login = async (data: LogInInput) => {
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

  const isPlatformAdmin = user.role === 'platform_admin' && user.restaurantId === null;

  if (isPlatformAdmin) {
    return { user: excludePassword(user) };
  } else {
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
  }
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

export const updateUserPartially = async (userId: string, data: Partial<User>) => {
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

  const updatedData: Partial<User> = {};

  if (data.firstName !== undefined) updatedData.firstName = data.firstName;
  if (data.lastName !== undefined) updatedData.lastName = data.lastName;
  if (data.email !== undefined) updatedData.email = data.email;
  if (data.phone !== undefined) updatedData.phone = data.phone;
  if (data.role !== undefined) updatedData.role = data.role;
  if (data.restaurantId !== undefined) updatedData.restaurantId = data.restaurantId;

  if (data.password) {
    updatedData.password = await hashPassword(data.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updatedData,
  });

  return excludePassword(updatedUser);
};

export const logOut = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
  return true;
};

export const refresh = async (data: RefreshTokenInput) => {
  const payload = verifyToken(data);

  const hashedRefreshToken = hashToken(data);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: hashedRefreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
  });
  if (!user) {
    throw new UnauthorizedError('Invalid or expired refresh token');
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

  return { accessToken, refreshToken };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { message: 'If the email exists, a reset link will be sent' };
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

  return { message: 'Reset link sent' };
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
export const validateAccessToken = async (token: string) => {
  try {
    const payload = verifyToken(token);

    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) {
      return { valid: false, user: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return { valid: false, user: null };
    }
    return { valid: true, user: excludePassword(user) };
  } catch {
    return { valid: false, user: null };
  }
};
