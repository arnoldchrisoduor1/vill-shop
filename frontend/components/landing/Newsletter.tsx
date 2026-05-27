'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@/components/ui';
import { subscribeNewsletter } from '@/lib/api/stats';
import { ApiFetchError } from '@/lib/api';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await subscribeNewsletter(email);
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      const message =
        err instanceof ApiFetchError ? err.message : 'Subscription failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container-page">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-8 md:p-12"
        >
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Stay in the Loop
            </h2>
            <p className="mt-2 text-white/80">
              Subscribe for exclusive deals, new arrivals, and event updates.
            </p>
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white"
                required
              />
              <Button
                type="submit"
                variant="secondary"
                isLoading={isLoading}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
