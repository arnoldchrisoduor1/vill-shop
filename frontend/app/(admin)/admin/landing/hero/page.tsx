'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Toggle, Card, CardContent, Modal } from '@/components/ui';
import {
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
} from '@/lib/api/stats';
import { heroSlideSchema, type HeroSlideFormData } from '@/validators';
import { ApiFetchError } from '@/lib/api';
import type { HeroSlide } from '@/types';

export default function HeroManagerPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<HeroSlideFormData>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: { is_active: true, sort_order: 0 },
  });

  const load = () => {
    getAdminHeroSlides()
      .then(setSlides)
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    reset({ is_active: true, sort_order: slides.length, title: '', image_url: '' });
    setModalOpen(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditing(slide);
    reset({
      title: slide.title,
      subtitle: slide.subtitle,
      cta_text: slide.cta_text,
      cta_url: slide.cta_url,
      image_url: slide.image_url,
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: HeroSlideFormData) => {
    setIsSaving(true);
    try {
      if (editing) {
        await updateHeroSlide(editing.id, data);
        toast.success('Slide updated');
      } else {
        await createHeroSlide(data);
        toast.success('Slide created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err instanceof ApiFetchError ? err.message : 'Failed to save slide');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this slide?')) return;
    try {
      await deleteHeroSlide(id);
      toast.success('Slide deleted');
      load();
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hero Manager</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />Add Slide</Button>
      </div>

      {loading ? (
        <p className="text-muted">Loading slides...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {slides.map((slide) => (
            <Card key={slide.id} padding="none" className="overflow-hidden">
              <div
                className="h-32 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image_url})` }}
              />
              <CardContent>
                <h3 className="font-semibold">{slide.title}</h3>
                {slide.subtitle && <p className="text-sm text-muted">{slide.subtitle}</p>}
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(slide)}>
                    <Pencil className="h-4 w-4" />Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Slide' : 'New Slide'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Input label="Subtitle" error={errors.subtitle?.message} {...register('subtitle')} />
          <Input label="Image URL" error={errors.image_url?.message} {...register('image_url')} />
          <Input label="CTA Text" error={errors.cta_text?.message} {...register('cta_text')} />
          <Input label="CTA URL" error={errors.cta_url?.message} {...register('cta_url')} />
          <Input label="Sort Order" type="number" error={errors.sort_order?.message} {...register('sort_order')} />
          <Toggle label="Active" checked={watch('is_active')} onChange={(v) => setValue('is_active', v)} />
          <div className="flex gap-2">
            <Button type="submit" isLoading={isSaving}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
