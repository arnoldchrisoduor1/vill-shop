'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { eventsApi } from '../../../../../../lib/api/events';
import { Input } from '../../../../../../components/ui/Input';
import { Textarea } from '../../../../../../components/ui/Textarea';
import { Button } from '../../../../../../components/ui/Button';
import { toast } from 'sonner';
import type { ShopEvent } from '../../../../../../types';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<ShopEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    eventsApi.getById(id).then(setEvent).catch(() => toast.error('Event not found'));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !id) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', event.title);
      formData.append('description', event.description);
      if (event.location) formData.append('location', event.location);
      if (image) formData.append('image', image);
      await eventsApi.update(id, formData);
      toast.success('Event updated!');
      router.push('/admin/events');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) return <div className="animate-pulse h-64 bg-[var(--color-border)] rounded" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Edit Event</h1>
      <form onSubmit={handleSave} className="max-w-2xl space-y-4">
        <Input label="Title" value={event.title} onChange={(e) => setEvent({ ...event, title: e.target.value })} />
        <Textarea label="Description" value={event.description} onChange={(e) => setEvent({ ...event, description: e.target.value })} rows={5} />
        <Input label="Location" value={event.location ?? ''} onChange={(e) => setEvent({ ...event, location: e.target.value })} />
        {event.coverImageUrl && (
          <img src={event.coverImageUrl} alt="" className="h-32 w-auto rounded border border-[var(--color-border)]" />
        )}
        <div>
          <label className="block text-sm font-medium mb-2">Replace Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={isLoading}>Save</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
