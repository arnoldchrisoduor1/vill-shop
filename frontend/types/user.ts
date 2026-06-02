export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin';
  isBanned: boolean;
  createdAt: string;
}
