export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  role: 'user' | 'platform_admin' | 'restaurant_user';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface IRestaurantUser {
  id: string;
  role: 'employee' | 'super-admin' | 'admin' | 'finance';
  restaurantId: string;
  userId: string;
}
