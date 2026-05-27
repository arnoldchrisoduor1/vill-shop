'use client';

import SkeletonLib from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export interface SkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  circle?: boolean;
  className?: string;
}

export function Skeleton({
  count = 1,
  height,
  width,
  circle,
  className,
}: SkeletonProps) {
  return (
    <SkeletonLib
      count={count}
      height={height}
      width={width}
      circle={circle}
      containerClassName={className}
      baseColor="var(--color-border)"
      highlightColor="var(--color-surface)"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Skeleton height={200} className="mb-4" />
      <Skeleton height={16} width="70%" className="mb-2" />
      <Skeleton height={14} width="40%" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} />
        </td>
      ))}
    </tr>
  );
}
