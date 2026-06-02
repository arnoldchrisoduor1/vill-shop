import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { getCategories } from '@/lib/api/categories';

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const pascalCase = name.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
  const Icon = icons[pascalCase] ?? icons['Tag'];
  return <Icon className={className} />;
}

export default async function CategoryLinks() {
  let categories = [];
  try {
    const res = await getCategories();
    categories = res.data.slice(0, 8);
  } catch {
    return null;
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
          Shop by Category
        </h2>
        <p className="text-[var(--color-text-muted)] mt-1">
          Find exactly what you&apos;re looking for
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
          >
            <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
              {category.icon ? (
                <DynamicIcon
                  name={category.icon}
                  className="h-5 w-5 text-[var(--color-primary)]"
                />
              ) : (
                <LucideIcons.Tag className="h-5 w-5 text-[var(--color-primary)]" />
              )}
            </div>
            <span className="text-xs font-medium text-[var(--color-text)] text-center leading-tight group-hover:text-[var(--color-primary)] transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
