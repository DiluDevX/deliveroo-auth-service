import { Prisma, User } from '@prisma/client';
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { hashPassword } from '../utils/password';
import { softDeleteAllRestaurantUserRecords } from './restaurantUser.service';

export const findManyWithoutPassword = async (
  where: Prisma.UserWhereInput
): Promise<Omit<User, 'password'>[]> => {
  const users = await prisma.user.findMany({
    where: where,
    omit: {
      password: true,
    },
  });

  return users;
};

export const findManyWithPassword = async (where: Prisma.UserWhereInput): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: where,
  });

  return users;
};

export const findOneWithoutPassword = async (
  where: Prisma.UserWhereUniqueInput
): Promise<Omit<User, 'password'> | null> => {
  return prisma.user.findUnique({
    where,
    omit: {
      password: true,
    },
  });
};

export const findOneWithPassword = async (
  where: Prisma.UserWhereUniqueInput
): Promise<User | null> => {
  return prisma.user.findUnique({
    where,
  });
};

export const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const create = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<Omit<User, 'password'>> => {
  const hashedPassword = await hashPassword(data.password);

  const createdUser = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
  const { password: _, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
};

export const updateUserPartially = async (
  userId: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'user' | 'platform_admin' | 'restaurant_user';
    password: string;
  }>
): Promise<Omit<User, 'password'> | null> => {
  try {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new NotFoundError('User not found');
    }
    throw error;
  }
};

export const softDeleteUser = async (userId: string) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await findOneWithoutPassword({
    id: userId,
  });

  // Perform soft delete by setting deletedAt timestamp
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });

  if (user && user.role === 'restaurant_user') {
    await softDeleteAllRestaurantUserRecords(userId);
  }

  return { success: true };
};
