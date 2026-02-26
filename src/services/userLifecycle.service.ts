import { BadRequestError } from '../utils/errors';
import { findOneWithoutPassword } from './users.database.service';
import { softDeleteAllRestaurantUserRecords } from './restaurantUser.service';

/**
 * Orchestrates the cascading soft deletion of a user and related records.
 * This module handles the coordination between user deletion and restaurant user cleanup
 * to avoid circular dependencies between users.database.service and restaurantUser.service.
 */
export const softDeleteUserWithCascade = async (userId: string) => {
  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const user = await findOneWithoutPassword({
    id: userId,
  });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  // Cascade soft delete to restaurant user records if needed
  if (user.role === 'restaurant_user') {
    await softDeleteAllRestaurantUserRecords(userId);
  }

  return user;
};
