export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  restaurantId: string | null;
  orderCount: number | null;
  role: 'user' | 'platform_admin' | 'restaurant_admin';
}
