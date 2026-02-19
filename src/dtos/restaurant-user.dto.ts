import { RestaurantRole } from '@prisma/client';

export type UpdateRestaurantUserRoleRequestBodyDTO = {
  userId: string;
  role: RestaurantRole;
  restaurantId: string;
};

export type UpdateRestaurantUserRoleResponseBodyDTO = {
  userId: string;
  role: RestaurantRole;
  restaurantId: string;
};
