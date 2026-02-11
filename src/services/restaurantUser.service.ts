import { UpdateRestaurantUserPartiallyInput } from '../schema/auth.schema';
import { prisma } from '../config/database';
import { BadRequestError } from '../utils/errors';
import { RestaurantRole } from '@prisma/client';

const roleMapping: Record<string, RestaurantRole> = {
  employee: 'employee',
  admin: 'admin',
  super_admin: 'super_admin',
  finance: 'finance',
};

export const updateRestaurantUserRole = async (data: UpdateRestaurantUserPartiallyInput) => {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  const updatedData: { role?: RestaurantRole } = {};
  if (data.role !== undefined) {
    updatedData.role = roleMapping[data.role];
  } else {
    throw new BadRequestError('Role is required');
  }

  // Find and update by userId AND restaurantId
  const updated = await prisma.restaurantUser.findFirst({
    where: {
      userId: data.userId,
      restaurantId: data.restaurantId,
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
