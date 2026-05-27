'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Input, Textarea, Toggle, Card, CardContent } from '@/components/ui';
import { createEvent } from '@/lib/api/events';
import { eventSchema, type EventFormData } from '@/validators';
import { ApiFetchError } from '@/lib/api';

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { is_active: true },
  });

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      await createEvent(data);
      toast.success('Event created');
      router.push('/admin/events');
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">New Event</h1>
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
            <Input label="Max Attendees" type="number" error={errors.max_attendees?.message} {...register('max_attendees')} />
            <Toggle label="Active" checked={watch('is_active')} onChange={(v) => setValue('is_active', v)} />
            <div className="flex gap-2">
              <Button type="submit" isLoading={isLoading}>Create Event</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
