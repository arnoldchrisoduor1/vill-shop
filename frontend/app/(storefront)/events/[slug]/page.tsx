import { notFound } from 'next/navigation';
import Image from 'next/image';
import { eventsApi } from '../../../../lib/api/events';
import { formatDate, formatDateTime } from '../../../../lib/utils';
import { Calendar, MapPin, Clock } from 'lucide-react';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await eventsApi.getBySlug(slug);
    return { title: event.title, description: event.description.slice(0, 160) };
  } catch {
    return { title: 'Event Not Found' };
  }
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  try {
    const event = await eventsApi.getBySlug(slug);
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {event.coverImageUrl && (
          <div className="relative h-80 rounded-[var(--radius)] overflow-hidden mb-8">
            <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" priority />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)] mb-8">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(event.startsAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDateTime(event.startsAt)} — {formatDateTime(event.endsAt)}
          </div>
          {event.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
        </div>
        <div className="prose max-w-none">
          <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
