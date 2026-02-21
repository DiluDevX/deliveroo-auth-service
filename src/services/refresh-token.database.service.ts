import { RefreshToken } from '@prisma/client';
import { prisma } from '../config/database';

export const findOne = async (token: string): Promise<RefreshToken | null> => {
  return prisma.refreshToken.findUnique({
    where: {
      token,
    },
  });
};

export const invalidateRefreshTokens = async (refreshToken: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};
