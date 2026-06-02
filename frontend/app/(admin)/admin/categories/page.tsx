'use client';

import { useEffect, useState } from 'react';
import { categoriesApi } from '../../../../lib/api/categories';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '../../../../types';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const emptyForm = { name: '', slug: '', icon: '', description: '' };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const loadCategories = () => {
    categoriesApi
      .getAll()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSlugTouched(false);
  };

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugTouched ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Name and slug are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon.trim() || undefined,
        description: form.description.trim() || undefined,
      };

      if (editingId) {
        const updated = await categoriesApi.update(editingId, payload);
        setCategories((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        toast.success('Category updated');
      } else {
        const created = await categoriesApi.create(payload);
        setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success('Category created');
      }
      resetForm();
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setSlugTouched(true);
    setForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      description: category.description || '',
    });
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      await categoriesApi.delete(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      if (editingId === category.id) resetForm();
      toast.success('Category deleted');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-8 max-w-2xl space-y-4 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? 'Edit Category' : 'New Category'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="col-span-2"
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
            }}
          />
          <Input
            label="Icon (optional)"
            value={form.icon}
            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
            placeholder="e.g. Laptop"
          />
        </div>
        <Textarea
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <div className="flex gap-3">
          <Button type="submit" isLoading={isSaving}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Update Category' : 'Create Category'}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-left">Icon</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.id}
                className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]"
              >
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{category.slug}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{category.icon || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(category)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="py-8 text-center text-[var(--color-text-muted)]">
            No categories yet. Create your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
