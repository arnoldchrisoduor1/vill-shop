'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Textarea, Toggle, Card, CardContent } from '@/components/ui';
import { getAdminEvents, updateEvent } from '@/lib/api/events';
import { eventSchema, type EventFormData } from '@/validators';
import { ApiFetchError } from '@/lib/api';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    getAdminEvents()
      .then((r) => {
        const event = r.data.find((e) => e.id === Number(params.id));
        if (event) {
          reset({
            title: event.title,
            description: event.description,
            location: event.location,
            starts_at: event.starts_at.slice(0, 16),
            ends_at: event.ends_at.slice(0, 16),
            max_attendees: event.max_attendees,
            is_active: event.is_active,
          });
        }
      })
      .finally(() => setLoadingEvent(false));
  }, [params.id, reset]);

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      await updateEvent(Number(params.id), data);
      toast.success('Event updated');
      router.push('/admin/events');
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : 'Failed to update event');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingEvent) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Edit Event</h1>
      <Card className="max-w-2xl">
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Title" error={errors.title?.message} {...register('title')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <Input label="Location" error={errors.location?.message} {...register('location')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Starts At" type="datetime-local" error={errors.starts_at?.message} {...register('starts_at')} />
              <Input label="Ends At" type="datetime-local" error={errors.ends_at?.message} {...register('ends_at')} />
            </div>
            <Toggle label="Active" checked={watch('is_active')} onChange={(v) => setValue('is_active', v)} />
            <div className="flex gap-2">
              <Button type="submit" isLoading={isLoading}>Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
