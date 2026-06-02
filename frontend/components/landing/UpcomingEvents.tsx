import Image from 'next/image';
import Link from 'next/link';
import { CalendarDays, MapPin } from 'lucide-react';
import { getEvents } from '@/lib/api/events';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

export default async function UpcomingEvents() {
  let events = [];
  try {
    const res = await getEvents({ limit: 3, isFeatured: true });
    events = res.data.items;
  } catch {
    return null;
  }

  if (events.length === 0) return null;

  return (
    <section className="py-16 bg-[var(--color-background)] px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)]">
            Upcoming Events
          </h2>
          <p className="text-[var(--color-text-muted)] mt-1">
            Don&apos;t miss out on our latest events
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Cover image */}
                <div className="relative h-44 bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/5">
                  {event.coverImageUrl ? (
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarDays className="h-12 w-12 text-[var(--color-primary)]/30" />
                    </div>
                  )}
                  {event.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary">Featured</Badge>
                    </div>
                  )}
                  {/* Date badge */}
                  <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 text-center shadow-sm">
                    <p className="text-xs font-bold text-[var(--color-primary)]">
                      {new Date(event.startsAt).toLocaleDateString('en-KE', {
                        month: 'short',
                      })}
                    </p>
                    <p className="text-lg font-bold leading-none text-[var(--color-text)]">
                      {new Date(event.startsAt).getDate()}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(event.startsAt)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <span className="text-xs font-medium text-[var(--color-primary)] group-hover:underline">
                      Learn more →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/events"
            className="inline-flex items-center text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            View all events →
          </Link>
        </div>
      </div>
    </section>
  );
}
