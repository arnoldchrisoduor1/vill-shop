import type { User } from './user';

export interface Review {
  id: number;
  product_id?: number;
  user_id?: number;
  user?: Pick<User, 'id' | 'name'>;
  rating: number;
  comment?: string;
  is_approved?: boolean;
  created_at: string;
}
