'use client';

import { useEffect, useState } from 'react';
import { HeroCarousel } from '@/components/landing/HeroCarousel';
import { FeaturedProducts } from '@/components/landing/FeaturedProducts';
import { UpcomingEvents } from '@/components/landing/UpcomingEvents';
import { CategoryLinks } from '@/components/landing/CategoryLinks';
import { SaleNewArrivals } from '@/components/landing/SaleNewArrivals';
import { StatsCounter } from '@/components/landing/StatsCounter';
import { Newsletter } from '@/components/landing/Newsletter';
import { getFeaturedProducts, getProducts } from '@/lib/api/products';
import { getUpcomingEvents } from '@/lib/api/events';
import { getHeroSlides } from '@/lib/api/stats';
import type { Product } from '@/types';
import type { Event } from '@/types';
import type { HeroSlide } from '@/types';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [featuredData, saleData, newData, eventsData, slidesData] =
          await Promise.allSettled([
            getFeaturedProducts(),
            getProducts({ per_page: 8 }),
            getProducts({ per_page: 8, sort: 'newest' }),
            getUpcomingEvents(),
            getHeroSlides(),
          ]);

        if (featuredData.status === 'fulfilled') setFeatured(featuredData.value);
        if (saleData.status === 'fulfilled') {
          setSaleProducts(
            saleData.value.data.filter((p) => p.is_on_sale || (p.compare_at_price && p.compare_at_price > p.price)).slice(0, 4),
          );
        }
        if (newData.status === 'fulfilled') setNewProducts(newData.value.data.slice(0, 4));
        if (eventsData.status === 'fulfilled') setEvents(eventsData.value);
        if (slidesData.status === 'fulfilled') setSlides(slidesData.value);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <HeroCarousel slides={slides} />
      <FeaturedProducts products={featured} loading={loading} />
      <CategoryLinks />
      <SaleNewArrivals
        saleProducts={saleProducts}
        newProducts={newProducts}
        loading={loading}
      />
      <UpcomingEvents events={events} />
      <StatsCounter />
      <Newsletter />
    </>
  );
}
