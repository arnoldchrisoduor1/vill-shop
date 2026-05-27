'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  UtensilsCrossed,
  Package,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { getCategories } from '@/lib/api/categories';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import type { Category } from '@/types';

const categoryIcons: Record<string, React.ElementType> = {
  electronics: Smartphone,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
  food: UtensilsCrossed,
  other: Package,
};

export function CategoryLinks() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const items =
    categories.length > 0
      ? categories.filter((c) => c.is_active).slice(0, 8)
      : PRODUCT_CATEGORIES.map((slug) => ({
          id: slug,
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          is_active: true,
        }));

  return (
    <section className="py-16">
      <div className="container-page">
        <h2 className="mb-8 text-center text-3xl font-bold">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {items.map((category, i) => {
            const slug = typeof category.id === 'number' ? category.slug : category.slug;
            const Icon = categoryIcons[slug] ?? Package;
            return (
              <motion.div
                key={String(category.id)}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/products?category=${slug}`}>
                  <Card
                    hover
                    padding="sm"
                    className="flex flex-col items-center text-center"
                  >
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium capitalize sm:text-sm">
                      {category.name}
                    </span>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
