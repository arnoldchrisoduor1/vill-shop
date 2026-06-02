export interface HeroSlide {
  id: string;
  headline: string;
  subtext?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}
