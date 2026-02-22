import { prisma } from '../config/database';
import { BadRequestError } from '../utils/errors';
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

  const updatedData: { role?: RestaurantRole } = {};
  if (user.role === 'restaurant_user') {
    updatedData.role = role;
  } else {
    throw new BadRequestError('Restaurant_User Role is required');
  }

  const updated = await prisma.restaurantUser.findFirst({
    where: {
      userId: userId,
      restaurantId: restaurantId,
    },
  });

  if (!updated) {
    throw new BadRequestError('Restaurant user record not found');
  }

  const result = await prisma.restaurantUser.update({
    where: { id: updated.id },
    data: updatedData,
  });

  return result;
};
