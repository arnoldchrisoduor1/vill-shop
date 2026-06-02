export interface Review {
  id: string;
  user: { id: string; name: string };
  rating: number;
  comment?: string;
  createdAt: string;
}
