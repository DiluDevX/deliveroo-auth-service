import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { RestaurantRole } from '@prisma/client';
import { findOneWithoutPassword } from './users.database.service';

export const updateRestaurantUserRole = async (
  userId: string,
  role: RestaurantRole,
  restaurantId: string
) => {
  const user = await findOneWithoutPassword({
    id: userId,
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (user.role === 'restaurant_user') {
    throw new BadRequestError('restaurant_User Role is required');
  }

  const updated = await prisma.restaurantUser.findFirst({
    where: {
      userId: userId,
      restaurantId: restaurantId,
    },
  });

  if (!updated) {
    throw new BadRequestError('Restaurant user record not found');
  } else if (updated.role === 'employee' || updated.role === 'finance') {
    throw new BadRequestError('Only restaurant admins/super_admins can update roles');
  }

  const result = await prisma.restaurantUser.update({
    where: { id: updated.id },
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
