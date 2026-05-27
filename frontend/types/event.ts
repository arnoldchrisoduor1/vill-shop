export interface Event {
  id: number;
  title: string;
  slug: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  image_url?: string;
  is_active: boolean;
  max_attendees?: number;
  current_attendees?: number;
  created_at: string;
  updated_at: string;
}
