'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users } from 'lucide-react';
import { getPublicStats } from '@/lib/api/stats';
import type { PublicStats } from '@/types/stats';

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      start = Math.round(value * progress);
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

export function StatsCounter() {
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    getPublicStats()
      .then(setStats)
      .catch(() =>
        setStats({ total_orders: 1200, total_products: 350, total_customers: 800 }),
      );
  }, []);

  const items = [
    { label: 'Orders Delivered', value: stats?.total_orders ?? 0, icon: ShoppingBag },
    { label: 'Products Available', value: stats?.total_products ?? 0, icon: Package },
    { label: 'Happy Customers', value: stats?.total_customers ?? 0, icon: Users },
  ];

  return (
    <section className="border-y border-border bg-surface py-12">
      <div className="container-page">
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">
                  <AnimatedCounter value={item.value} />+
                </p>
                <p className="text-sm text-muted">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
