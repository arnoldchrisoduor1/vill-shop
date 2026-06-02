import Link from 'next/link';
import Image from 'next/image';
import { eventsApi } from '../../../lib/api/events';
import { formatDate } from '../../../lib/utils';
import { Calendar, MapPin } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Events' };

export default async function EventsPage() {
  const events = await eventsApi.getAll().catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Upcoming Events</h1>
      {events.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-12">No upcoming events.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`}>
              <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow">
                {event.coverImageUrl && (
                  <div className="relative h-48">
                    <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2">{event.description}</p>
                  <div className="space-y-1 text-sm text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.startsAt)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
