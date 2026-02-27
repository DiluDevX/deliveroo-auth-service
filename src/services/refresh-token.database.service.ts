import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';
import { hashToken } from '../utils/jwt';

export const findOne = async (token: string): Promise<RefreshToken | null> => {
  return prisma.refreshToken.findUnique({
    where: {
      token,
    },
  });
};

export const invalidateRefreshTokens = async (refreshToken: string): Promise<void> => {
  const hashedRefreshToken = hashToken(refreshToken);
  await prisma.refreshToken.deleteMany({
    where: { token: hashedRefreshToken },
  });
};
