import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'image';
  lines?: number;
}

export function Skeleton({ className, variant = 'text', lines = 3 }: SkeletonProps) {
  const base = 'animate-pulse bg-[var(--color-border)] rounded-[var(--radius)]';

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(base, 'h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden', className)}>
        <div className={cn(base, 'h-48 rounded-none')} />
        <div className="p-4 space-y-2">
          <div className={cn(base, 'h-4 w-3/4')} />
          <div className={cn(base, 'h-4 w-1/2')} />
          <div className={cn(base, 'h-8 w-1/3 mt-2')} />
        </div>
      </div>
    );
  }

  if (variant === 'circle') {
    return <div className={cn(base, 'h-10 w-10 rounded-full', className)} />;
  }

  return <div className={cn(base, 'h-64 w-full', className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--color-border)] overflow-hidden">
      <Skeleton variant="image" className="h-48 rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
        <Skeleton variant="text" className="w-1/3 h-6" />
      </div>
    </div>
  );
}

export default Skeleton;
