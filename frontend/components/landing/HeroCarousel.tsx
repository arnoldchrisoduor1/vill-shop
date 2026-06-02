'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import type { HeroSlide } from '../../types';

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="h-[500px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to Vill Shop</h1>
          <p className="text-xl mb-8 opacity-80">Quality products at great prices</p>
          <Link href="/products"><Button size="lg" variant="secondary">Shop Now</Button></Link>
        </div>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div className="relative h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {slide.imageUrl ? (
            <Image src={slide.imageUrl} alt={slide.headline} fill className="object-cover" priority />
          ) : (
            <div className="h-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)]" />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold mb-4"
              >
                {slide.headline}
              </motion.h1>
              {slide.subtext && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl mb-8 opacity-90"
                >
                  {slide.subtext}
                </motion.p>
              )}
              {slide.ctaLabel && slide.ctaUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Link href={slide.ctaUrl}>
                    <Button size="lg" variant="secondary">{slide.ctaLabel}</Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
