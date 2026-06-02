'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ShoppingBag, Package, Users } from 'lucide-react';
import type { StoreStats } from '../../types';

function AnimatedCount({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const step = target / (duration * 60);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export function SocialProof({ stats }: { stats: StoreStats }) {
  const items = [
    { icon: ShoppingBag, label: 'Orders Fulfilled', value: stats.totalOrders },
    { icon: Package, label: 'Products Available', value: stats.totalProducts },
    { icon: Users, label: 'Happy Customers', value: stats.totalCustomers },
  ];

  return (
    <section className="py-16 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(({ icon: Icon, label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Icon className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-3" />
              <div className="text-4xl font-bold text-[var(--color-text)] mb-1">
                <AnimatedCount target={value} />+
              </div>
              <p className="text-[var(--color-text-muted)]">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
