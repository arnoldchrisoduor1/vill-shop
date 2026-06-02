'use client';

import { useEffect, useState } from 'react';
import { heroSlidesApi } from '../../../../../lib/api/hero-slides';
import { Toggle } from '../../../../../components/ui/Toggle';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Textarea } from '../../../../../components/ui/Textarea';
import { Skeleton } from '../../../../../components/ui/Skeleton';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import type { HeroSlide } from '../../../../../types';

interface SlideForm {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaUrl: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: SlideForm = {
  headline: '',
  subtext: '',
  ctaLabel: '',
  ctaUrl: '',
  sortOrder: 0,
  isActive: true,
};

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm);
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSlides = () => {
    heroSlidesApi.getAdminAll().then(setSlides).catch(() => setSlides([])).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSlides();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sortOrder: slides.length });
    setImage(null);
    setShowForm(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setForm({
      headline: slide.headline,
      subtext: slide.subtext ?? '',
      ctaLabel: slide.ctaLabel ?? '',
      ctaUrl: slide.ctaUrl ?? '',
      sortOrder: slide.sortOrder,
      isActive: slide.isActive,
    });
    setImage(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.headline.trim()) {
      toast.error('Headline is required');
      return;
    }
    if (!editingId && !image) {
      toast.error('Image is required for new slides');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('headline', form.headline);
      if (form.subtext) formData.append('subtext', form.subtext);
      if (form.ctaLabel) formData.append('ctaLabel', form.ctaLabel);
      if (form.ctaUrl) formData.append('ctaUrl', form.ctaUrl);
      formData.append('sortOrder', String(form.sortOrder));
      formData.append('isActive', String(form.isActive));
      if (image) formData.append('image', image);

      if (editingId) {
        await heroSlidesApi.update(editingId, formData);
        toast.success('Slide updated');
      } else {
        await heroSlidesApi.create(formData);
        toast.success('Slide created');
      }
      closeForm();
      loadSlides();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await heroSlidesApi.delete(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      toast.success('Slide deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (slide: HeroSlide) => {
    try {
      const updated = await heroSlidesApi.toggleActive(slide.id);
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
    } catch {
      toast.error('Failed');
    }
  };

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Hero Slides</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Slide</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-8 bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editingId ? 'Edit Slide' : 'New Slide'}</h2>
            <button type="button" onClick={closeForm} className="text-[var(--color-text-muted)]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <Input label="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required />
          <Textarea label="Subtext" value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CTA Label" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} />
            <Input label="CTA URL" value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} />
          </div>
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <Toggle label="Active" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          <div>
            <label className="block text-sm font-medium mb-2">{editingId ? 'Replace Image (optional)' : 'Image'}</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={saving}>{editingId ? 'Save Changes' : 'Create Slide'}</Button>
            <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {slides.map((slide, idx) => (
          <div key={slide.id} className="bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] p-4 flex items-center gap-4">
            {slide.imageUrl && (
              <img src={slide.imageUrl} alt="" className="h-16 w-24 object-cover rounded border border-[var(--color-border)]" />
            )}
            <span className="text-[var(--color-text-muted)] font-mono w-6">{idx + 1}</span>
            <div className="flex-1">
              <p className="font-medium">{slide.headline}</p>
              {slide.subtext && <p className="text-sm text-[var(--color-text-muted)]">{slide.subtext}</p>}
              {slide.ctaLabel && (
                <p className="text-xs text-[var(--color-primary)]">CTA: {slide.ctaLabel} → {slide.ctaUrl}</p>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={() => openEdit(slide)}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Toggle label="Active" checked={slide.isActive} onChange={() => handleToggle(slide)} />
            <Button size="sm" variant="danger" onClick={() => handleDelete(slide.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {slides.length === 0 && (
          <p className="text-center py-8 text-[var(--color-text-muted)]">No hero slides. Add one!</p>
        )}
      </div>
    </div>
  );
}
