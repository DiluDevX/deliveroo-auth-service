export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  password: string;
  role: 'user' | 'admin';
}
