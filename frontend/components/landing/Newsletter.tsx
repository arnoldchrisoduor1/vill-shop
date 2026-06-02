'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { newsletterApi } from '../../lib/api/newsletter';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await newsletterApi.subscribe(email);
      toast.success('Subscribed! Thank you for joining.');
      setEmail('');
    } catch {
      toast.error('Already subscribed or invalid email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[var(--color-primary)] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <Mail className="h-12 w-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">Stay Updated</h2>
          <p className="text-white/80 mb-6">Get the latest products and deals delivered to your inbox.</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-[var(--radius)] border-0 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button type="submit" variant="secondary" size="lg" isLoading={isLoading}>
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
