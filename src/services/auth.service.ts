import { prisma } from '../config/database';
import { comparePasswords, hashPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, hashToken, verifyToken } from '../utils/jwt';
import { LogInInput, RefreshTokenInput, SignUpInput } from '../schema/auth.schema';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
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
    },
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
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

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
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
      console.error('Global fetch is not available. Use Node 18+ or add a fetch polyfill.');
      return { message: 'Something went wrong.' };
    }
    const mailServiceUrl = process.env.MAIL_SERVICE_URL;
    if (!mailServiceUrl) {
      console.error('MAIL_SERVICE_URL is not set');
      return { message: 'Something went wrong.' };
    }
    const res = await fetch(`${process.env.MAIL_SERVICE_URL}/send-reset-password-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    });
    if (!res.ok) {
      console.error(`Failed to send email: ${res.status} ${res.statusText}`);
      return { message: 'Something went wrong.' };
    }
    return { message: 'If the email exists, a reset link will be sent' };
  } catch {
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
