import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { RestaurantRole } from '@prisma/client';
import { findOneWithoutPassword } from './users.database.service';

const validateUserPermissions = async (userId: string) => {
  const user = await findOneWithoutPassword({
    id: userId,
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (user.role !== 'restaurant_user') {
    throw new BadRequestError('restaurant_user Role is required');
  }

  return user;
};

const validateRestaurantUserRecord = async (userId: string, restaurantId: string) => {
  const restaurantUser = await prisma.restaurantUser.findFirst({
    where: {
      userId: userId,
      restaurantId: restaurantId,
    },
  });

  if (!restaurantUser) {
    throw new BadRequestError('Restaurant user record not found');
  }

  const isRestrictedRole = restaurantUser.role === 'employee' || restaurantUser.role === 'finance';
  if (isRestrictedRole) {
    throw new BadRequestError('Only restaurant admins/super_admins can update roles');
  }

  return restaurantUser;
};

export const updateRestaurantUserRole = async (
  userId: string,
  role: RestaurantRole,
  restaurantId: string
) => {
  await validateUserPermissions(userId);
  const restaurantUser = await validateRestaurantUserRecord(userId, restaurantId);

  const result = await prisma.restaurantUser.update({
    where: { id: restaurantUser.id },
    data: { role: role },
  });

  return result;
};

export const softDeleteAllRestaurantUserRecords = async (userId: string) => {
  const updated = await prisma.restaurantUser.findMany({
    where: {
      userId: userId,
    },
  });

  if (updated.length === 0) {
    throw new NotFoundError('Restaurant user record not found');
  }
  await prisma.restaurantUser.updateMany({
    where: {
      userId: userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });
};
