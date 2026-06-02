import Image from 'next/image';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import type { ShopEvent } from '@/types/event';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

interface EventDetailProps {
  event: ShopEvent;
}

export default function EventDetail({ event }: EventDetailProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cover Image */}
      {event.coverImageUrl && (
        <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden mb-8">
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-4">
        {event.isFeatured && <Badge variant="primary">Featured</Badge>}
        {event.isPublished ? (
          <Badge variant="success">Published</Badge>
        ) : (
          <Badge variant="warning">Unpublished</Badge>
        )}
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-6">
        {event.title}
      </h1>

      {/* Meta info */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
          <CalendarDays className="h-5 w-5 text-[var(--color-primary)] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Starts
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5">
              {formatDate(event.startsAt)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--color-secondary)]/5 border border-[var(--color-secondary)]/10">
          <Clock className="h-5 w-5 text-[var(--color-secondary)] mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              Ends
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5">
              {formatDate(event.endsAt)}
            </p>
          </div>
        </div>

        {event.location && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-[var(--color-border)]">
            <MapPin className="h-5 w-5 text-[var(--color-text-muted)] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                Location
              </p>
              <p className="text-sm font-semibold text-[var(--color-text)] mt-0.5">
                {event.location}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none">
        <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
          {event.description}
        </p>
      </div>
    </article>
  );
}
