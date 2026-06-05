import Link from 'next/link';
import Image from 'next/image';
import { heroSlidesApi } from '../../lib/api/hero-slides';
import { productsApi } from '../../lib/api/products';
import { eventsApi } from '../../lib/api/events';
import { categoriesApi } from '../../lib/api/categories';
import { statsApi } from '../../lib/api/stats';
import { HeroCarousel } from '../../components/landing/HeroCarousel';
import { Newsletter } from '../../components/landing/Newsletter';
import { SocialProof } from '../../components/landing/SocialProof';
import { ProductCard } from '../../components/products/ProductCard';
import { formatDate } from '../../lib/utils';
import { resolveMediaUrl } from '../../lib/media';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

async function getData() {
  const [slides, featuredProducts, featuredEvents, categories, stats] = await Promise.allSettled([
    heroSlidesApi.getAll().catch(() => []),
    productsApi.getAll({ featured: true, limit: 8 }).catch(() => ({ items: [] })),
    eventsApi.getFeatured().catch(() => []),
    categoriesApi.getAll().catch(() => []),
    statsApi.getStats().catch(() => ({ totalOrders: 0, totalProducts: 0, totalCustomers: 0 })),
  ]);

  return {
    slides: slides.status === 'fulfilled' ? slides.value : [],
    featuredProducts: featuredProducts.status === 'fulfilled' ? (featuredProducts.value?.items ?? []) : [],
    featuredEvents: featuredEvents.status === 'fulfilled' ? featuredEvents.value : [],
    categories: categories.status === 'fulfilled' ? categories.value : [],
    stats: stats.status === 'fulfilled' ? stats.value : { totalOrders: 0, totalProducts: 0, totalCustomers: 0 },
  };
}

export default async function HomePage() {
  const { slides, featuredProducts, featuredEvents, categories, stats } = await getData();

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel slides={Array.isArray(slides) ? slides : []} />

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Featured Products</h2>
          <Link href="/products" className="flex items-center gap-1 text-[var(--color-primary)] text-sm font-medium hover:gap-2 transition-all">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-[var(--color-text-muted)] text-center py-8">No featured products yet.</p>
        )}
      </section>

      {/* Upcoming Events */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-[var(--color-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Link href="/events" className="flex items-center gap-1 text-[var(--color-primary)] text-sm font-medium">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.slice(0, 3).map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <div className="bg-white rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow">
                    {resolveMediaUrl(event.coverImageUrl) && (
                      <div className="relative h-48">
                        <Image src={resolveMediaUrl(event.coverImageUrl)!} alt={event.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] mb-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.startsAt)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Quick Links */}
      {categories.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.slice(0, 10).map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-[var(--radius)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors text-center">
                  <span className="text-3xl">🛍️</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Social Proof */}
      <SocialProof stats={stats} />

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
}
