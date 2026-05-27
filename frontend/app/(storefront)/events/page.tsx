'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { getEvents } from '@/lib/api/events';
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="mt-1 text-muted">Discover upcoming community events</p>
      </div>

      {loading ? (
        <p className="text-muted">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-muted">No upcoming events at the moment.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                      {event.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <h2 className="text-lg font-semibold">{event.title}</h2>
                    <div className="mt-2 space-y-1 text-sm text-muted">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.starts_at)}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </p>
                      {event.max_attendees && (
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {event.current_attendees ?? 0} / {event.max_attendees} attendees
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
