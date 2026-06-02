'use client';

import Image from 'next/image';

interface ImageUploadPreviewProps {
  files: FileList | null;
  existingUrls?: string[];
  label?: string;
  onChange: (files: FileList | null) => void;
}

export function ImageUploadPreview({
  files,
  existingUrls = [],
  label = 'Images',
  onChange,
}: ImageUploadPreviewProps) {
  const previews = files ? Array.from(files).map((f) => URL.createObjectURL(f)) : [];

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => onChange(e.target.files)}
        className="block w-full text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[var(--color-primary)] file:text-white"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        {existingUrls.map((url) => (
          <div key={url} className="relative h-20 w-20 rounded overflow-hidden border border-[var(--color-border)]">
            <Image src={url} alt="" fill className="object-cover" />
          </div>
        ))}
        {previews.map((url) => (
          <div key={url} className="relative h-20 w-20 rounded overflow-hidden border border-[var(--color-border)]">
            <Image src={url} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    </div>
  );
}
