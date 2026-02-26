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

const validateTokenSignature = (refreshToken: string): void => {
  try {
    verifyToken(refreshToken);
  } catch (error) {
    if (error instanceof Error) {
      throw new UnauthorizedError(error.message);
    }
    throw new UnauthorizedError('Invalid refresh token');
  }
};

const validateStoredRefreshToken = async (hashedRefreshToken: string): Promise<RefreshToken> => {
  const foundRefreshToken = await refreshTokenDatabaseService.findOne(hashedRefreshToken);

  if (!foundRefreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (dayjs(foundRefreshToken.expiresAt).isBefore(dayjs())) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  return foundRefreshToken;
};

const validateUserExists = async (userId: string): Promise<User> => {
  const foundUser = await usersDatabaseService.findUserById(userId);

  if (!foundUser) {
    throw new NotFoundError('User not found');
  }

  return foundUser;
};

export const verifyRefreshToken = async (refreshToken: string): Promise<[User, RefreshToken]> => {
  validateTokenSignature(refreshToken);

  const hashedRefreshToken = hashToken(refreshToken);
  const storedRefreshToken = await validateStoredRefreshToken(hashedRefreshToken);
  const user = await validateUserExists(storedRefreshToken.userId);

  return [user, storedRefreshToken];
};
