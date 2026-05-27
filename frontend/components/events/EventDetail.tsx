'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui';
import { getEvent } from '@/lib/api/events';
import type { Event } from '@/types';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-KE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface EventDetailProps {
  slug: string;
}

export function EventDetail({ slug }: EventDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(slug)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-16 text-center text-muted">
        Loading event...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold">Event not found</h1>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="relative mb-8 h-64 overflow-hidden rounded-xl bg-primary/10 md:h-96">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-16 w-16 text-primary" />
            </div>
          )}
        </div>

        <Badge variant="primary" className="mb-4">
          {event.is_active ? 'Active Event' : 'Past Event'}
        </Badge>

        <h1 className="text-3xl font-bold md:text-4xl">{event.title}</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted">Starts</p>
              <p className="font-medium">{formatDate(event.starts_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted">Ends</p>
              <p className="font-medium">{formatDate(event.ends_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-4">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted">Location</p>
              <p className="font-medium">{event.location}</p>
            </div>
          </div>
          {event.max_attendees && (
            <div className="flex items-center gap-3 rounded-lg border border-border p-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted">Attendees</p>
                <p className="font-medium">
                  {event.current_attendees ?? 0} / {event.max_attendees}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="prose mt-8 max-w-none">
          <h2 className="text-xl font-semibold">About This Event</h2>
          <p className="mt-2 text-muted whitespace-pre-wrap">{event.description}</p>
        </div>
      </motion.div>
    </div>
  );
}
