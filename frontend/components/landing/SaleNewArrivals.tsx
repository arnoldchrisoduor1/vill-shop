import Link from 'next/link';
import { getProducts } from '@/lib/api/products';
import ProductCard from '@/components/products/ProductCard';

export default async function SaleNewArrivals() {
  let saleProducts = [];
  let newArrivals = [];

  try {
    const [saleRes, newRes] = await Promise.all([
      getProducts({ tags: 'sale', limit: 4 }),
      getProducts({ sort: 'createdAt:desc', limit: 4 }),
    ]);
    saleProducts = saleRes.data.items;
    newArrivals = newRes.data.items;
  } catch {
    return null;
  }

  if (saleProducts.length === 0 && newArrivals.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Sale Items */}
        {saleProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                  🔥 On Sale
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Limited time deals
                </p>
              </div>
              <Link
                href="/products?tags=sale"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
                  ✨ New Arrivals
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Just dropped
                </p>
              </div>
              <Link
                href="/products?sort=createdAt:desc"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
