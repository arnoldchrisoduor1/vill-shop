'use client';

import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  className?: string;
}

const variants = {
  primary: 'bg-primary/10 text-primary-dark',
  secondary: 'bg-secondary/10 text-secondary-dark',
  outline: 'border border-border text-muted',
  success: 'bg-success/10 text-secondary-dark',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
};

export function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
