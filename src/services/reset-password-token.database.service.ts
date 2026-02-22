import { PasswordResetToken } from '@prisma/client';
import { prisma } from '../config/database';
import { hashToken } from '../utils/jwt';
import dayjs from 'dayjs';
import crypto from 'node:crypto';
import { UnauthorizedError } from '../utils/errors';

export const deleteResetPasswordToken = async (token: string): Promise<void> => {
  const hashedToken = hashToken(token);

  await prisma.passwordResetToken.deleteMany({
    where: {
      token: hashedToken,
    },
  });
};

export const verifyResetPasswordToken = async (token: string): Promise<PasswordResetToken> => {
  const hashedToken = hashToken(token);

  const foundResetPasswordToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: hashedToken,
    },
  });

  if (!foundResetPasswordToken || dayjs(foundResetPasswordToken.expiresAt).isBefore(dayjs())) {
    throw new UnauthorizedError('Invalid email or reset token');
  }

  return foundResetPasswordToken;
};

export const createResetPasswordToken = async ({
  userId,
}: {
  userId: string;
}): Promise<{ token: string; record: PasswordResetToken }> => {
  const token = crypto.randomBytes(32).toString('hex');

  const hashedToken = hashToken(token);

  const record = await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      userId,
      expiresAt: dayjs().add(1, 'hour').toDate(),
    },
  });

  return { token, record };
};
