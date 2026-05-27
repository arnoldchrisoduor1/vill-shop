'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui';

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Verified Buyer',
    rating: 5,
    text: 'Amazing quality and fast delivery! Vill Shop has become my go-to for everything.',
  },
  {
    name: 'James K.',
    role: 'Verified Buyer',
    rating: 5,
    text: 'The customer service is exceptional. They went above and beyond to help with my order.',
  },
  {
    name: 'Amina W.',
    role: 'Verified Buyer',
    rating: 5,
    text: 'Great prices and a wide selection. I love the new arrivals section!',
  },
];

export function SocialProof() {
  return (
    <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
          <p className="mt-2 text-muted">Trusted by thousands of happy shoppers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative h-full">
                <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/20" />
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-muted">&ldquo;{item.text}&rdquo;</p>
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
