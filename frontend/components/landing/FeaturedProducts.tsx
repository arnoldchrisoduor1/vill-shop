import { getFeaturedProducts } from '@/lib/api/products';
import ProductCard from '@/components/products/ProductCard';

export default async function FeaturedProducts() {
  let products = [];
  try {
    const res = await getFeaturedProducts();
    products = res.data.items;
  } catch {
    return null;
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          Featured Products
        </h2>
        <p className="text-[var(--color-text-muted)] mt-1">
          Hand-picked selections just for you
        </p>
      </div>

      {/* Desktop: 4 col grid. Mobile: horizontal scroll */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 sm:hidden snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product.id} className="shrink-0 w-64 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
