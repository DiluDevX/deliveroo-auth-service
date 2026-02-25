import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, hashToken, verifyToken } from '../utils/jwt';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { RefreshToken, Role, User } from '@prisma/client';
import dayjs from 'dayjs';
import * as refreshTokenDatabaseService from './refresh-token.database.service';
import * as usersDatabaseService from './users.database.service';

export const generateNewTokens = async ({
  id,
  role,
  email,
}: {
  id: string;
  email: string;
  role: Role;
}): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const accessToken = generateAccessToken({
    userId: id,
    email,
    role,
  });

  const refreshToken = generateRefreshToken({
    userId: id,
    email,
    role,
  });

  const hashedRefreshToken = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      userId: id,
      expiresAt: dayjs().add(7, 'days').toDate(),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const verifyRefreshToken = async (refreshToken: string): Promise<[User, RefreshToken]> => {
  try {
    verifyToken(refreshToken);
  } catch (error) {
    if (error instanceof Error) {
      throw new UnauthorizedError(error.message);
    }
    throw new UnauthorizedError('Invalid refresh token');
  }

  const hashedRefreshToken = hashToken(refreshToken);

  const foundRefreshToken = await refreshTokenDatabaseService.findOne(hashedRefreshToken);

  if (!foundRefreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const foundUser = await usersDatabaseService.findUserById(foundRefreshToken.userId);

  if (!foundUser) {
    throw new NotFoundError('User not found');
  }

  return [foundUser, foundRefreshToken];
};
