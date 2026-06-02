'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventSchema, type EventFormData } from '../../../../../validators/event';
import { eventsApi } from '../../../../../lib/api/events';
import { Input } from '../../../../../components/ui/Input';
import { Textarea } from '../../../../../components/ui/Textarea';
import { Button } from '../../../../../components/ui/Button';
import { toast } from 'sonner';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function NewEventPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('slug', data.slug || slugify(data.title));
      formData.append('description', data.description);
      formData.append('startsAt', new Date(data.startsAt).toISOString());
      formData.append('endsAt', new Date(data.endsAt).toISOString());
      if (data.location) formData.append('location', data.location);
      formData.append('isPublished', 'true');
      if (image) formData.append('image', image);
      await eventsApi.create(formData);
      toast.success('Event created!');
      router.push('/admin/events');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">New Event</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <Input label="Title" {...register('title')} error={errors.title?.message}
          onChange={(e) => {
            register('title').onChange(e);
            if (!watch('slug')) setValue('slug', slugify(e.target.value));
          }} />
        <Input label="Slug" {...register('slug')} error={errors.slug?.message} />
        <Textarea label="Description" {...register('description')} error={errors.description?.message} rows={5} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Starts At" type="datetime-local" {...register('startsAt')} error={errors.startsAt?.message} />
          <Input label="Ends At" type="datetime-local" {...register('endsAt')} error={errors.endsAt?.message} />
        </div>
        <Input label="Location (optional)" {...register('location')} />
        <div>
          <label className="block text-sm font-medium mb-2">Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
        </div>
        <div className="flex gap-3">
          <Button type="submit" isLoading={isLoading}>Create Event</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
