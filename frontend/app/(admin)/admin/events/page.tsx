'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { eventsApi } from '../../../../lib/api/events';
import { Toggle } from '../../../../components/ui/Toggle';
import { Button } from '../../../../components/ui/Button';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { formatDate } from '../../../../lib/utils';
import { Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';
import type { ShopEvent } from '../../../../types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<ShopEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAdminAll().then(setEvents).catch(() => setEvents([])).finally(() => setIsLoading(false));
  }, []);

  const togglePublished = async (event: ShopEvent) => {
    try {
      const updated = await eventsApi.togglePublished(event.id);
      setEvents((prev) => prev.map((e) => e.id === event.id ? updated : e));
    } catch { toast.error('Failed to update'); }
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/admin/events/new"><Button><Plus className="h-4 w-4" /> New Event</Button></Link>
      </div>
      <div className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-center">Published</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                <td className="px-4 py-3 font-medium">{event.title}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{formatDate(event.startsAt)}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{event.location ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <Toggle checked={event.isPublished} onChange={() => togglePublished(event)} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {events.length === 0 && <p className="text-center py-8 text-[var(--color-text-muted)]">No events yet.</p>}
      </div>
    </div>
  );
}
