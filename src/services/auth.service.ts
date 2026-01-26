import { prisma } from '../config/database';
import { hashPassword, comparePasswords } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { SignUpInput, LogInInput, RefreshTokenInput } from '../schema/auth.schema';
import { BadRequestError, UnauthorizedError, ConflictError } from '../utils/errors';
import crypto from 'node:crypto';
import { User } from '../types/global';

// Helper to exclude password from user object
const excludePassword = (user: User) => {
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
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: excludePassword(user),
    token: accessToken,
    refreshToken,
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

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
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

export const refresh = async (data: RefreshTokenInput) => {
  const payload = verifyToken(data.refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: data.refreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });
  const refreshToken = generateRefreshToken({
    userId: payload.id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    role: payload.role,
  });

  await prisma.refreshToken.delete({
    where: { token: data.refreshToken },
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
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

  await prisma.passwordReset.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await sendResetPasswordEmail(token, email);

  return { message: 'Reset link sent' };
};

export const sendResetPasswordEmail = async (token: string, email: string) => {
  try {
    await fetch(`${process.env.MAIL_SERVICE_URL}/send-reset-password-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    });
    return { message: 'If the email exists, a reset link will be sent' };
  } catch {
    return { message: 'Something went wrong.' };
  }
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token } ,
  });

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!resetRecord || resetRecord.expiresAt < new Date() || !user || user.id !== resetRecord.userId) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { password: hashedPassword },
  });

  // Delete used token
  await prisma.passwordReset.delete({
    where: { token },
  });

  return { message: 'Password reset successful' };
};
