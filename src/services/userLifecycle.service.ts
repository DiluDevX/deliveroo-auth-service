import { BadRequestError, NotFoundError } from '../utils/errors';
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
    throw new NotFoundError('User not found');
  } else if (user.deletedAt) {
    throw new BadRequestError('User is already deleted');
  }

  // Cascade soft delete to restaurant user records if needed
  if (user.role === 'restaurant_user') {
    await softDeleteAllRestaurantUserRecords(userId);
  }

  return user;
};
