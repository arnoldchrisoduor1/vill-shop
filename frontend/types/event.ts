export interface ShopEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location?: string;
  isPublished: boolean;
  isFeatured: boolean;
  coverImageUrl?: string;
}
