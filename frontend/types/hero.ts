export interface HeroSlide {
  id: number;
  title: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
