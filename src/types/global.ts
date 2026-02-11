export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  role: 'user' | 'platform_admin' | 'restaurant_user';
}

export interface RestaurantUser {
  id: string;
  role: 'employee' | 'super-admin' | 'admin' | 'finance';
  restaurantId: string;
  userId: string;
}
