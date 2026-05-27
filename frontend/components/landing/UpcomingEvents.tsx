'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import type { Event } from '@/types';

interface UpcomingEventsProps {
  events: Event[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="bg-surface py-16">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <p className="mt-2 text-muted">Join us at our next community gatherings</p>
          </div>
          <Link
            href="/events"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            All Events <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/events/${event.slug}`}>
                <Card hover padding="none" className="overflow-hidden">
                  <div className="relative h-48 bg-primary/10">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Calendar className="h-12 w-12 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Badge variant="primary" className="mb-2">
                      Event
                    </Badge>
                    <h3 className="font-semibold">{event.title}</h3>
                    <div className="mt-2 space-y-1 text-sm text-muted">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.starts_at)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
