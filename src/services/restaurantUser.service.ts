import { prisma } from '../config/database';
import { BadRequestError } from '../utils/errors';
import { RestaurantRole } from '@prisma/client';
import { findOneWithoutPassword } from './users.database.service';

const roleMapping: Record<string, RestaurantRole> = {
  employee: 'employee',
  admin: 'admin',
  super_admin: 'super_admin',
  finance: 'finance',
};

export const updateRestaurantUserRole = async (
  userId: string,
  role: RestaurantRole,
  restaurantId: string
) => {
  // Verify user exists
  const user = await findOneWithoutPassword({
    id: userId,
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  const updatedData: { role?: RestaurantRole } = {};
  if (user.role === 'restaurant_user') {
    updatedData.role = roleMapping[role];
  } else {
    throw new BadRequestError('Restaurant_User Role is required');
  }

  // Find and update by userId AND restaurantId
  const updated = await prisma.restaurantUser.findFirst({
    where: {
      userId: userId,
      restaurantId: restaurantId,
    },
  });

  if (!updated) {
    throw new BadRequestError('Restaurant user record not found');
  }

  // Update the found record
  const result = await prisma.restaurantUser.update({
    where: { id: updated.id },
    data: updatedData,
  });

  return result;
};
