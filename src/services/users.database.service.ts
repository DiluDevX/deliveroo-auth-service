import { prisma } from '../config/database';
import {
  CreateUserResponseBodyDTO,
  GetAllUsersResponseBodyDTO,
  GetSingleUserResponseBodyDTO,
} from '../dtos/user.dto';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { hashPassword } from '../utils/password';
import { excludePassword } from './auth.service';

export const getAll = async (): Promise<GetAllUsersResponseBodyDTO> => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
  });
  return {
    users: users.map(excludePassword),
  };
};

export const findUserById = async (userId: string): Promise<GetSingleUserResponseBodyDTO> => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError('User not found');
  }

  return {
    user: excludePassword(user),
  };
};

export const createUser = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'user' | 'platform_admin' | 'restaurant_user';
}): Promise<CreateUserResponseBodyDTO> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new BadRequestError('Email already in use');
  }
  const hashedPassword = await hashPassword(data.password);
  data.password = hashedPassword;

  const newUser = await prisma.user.create({
    data,
  });

  return {
    message: 'User created successfully',
    user: excludePassword(newUser),
  };
};

export const updateUserPartially = async (
  userId: string,
  data: Partial<{ firstName: string; lastName: string; email: string; phone?: string }>
) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.deletedAt) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return excludePassword(updatedUser);
};

export const softDeleteUser = async (userId: string) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Perform soft delete by setting deletedAt timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  return { success: true };
};
