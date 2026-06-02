import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary-dark)]',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  outline: 'border border-[var(--color-border)] text-[var(--color-text-muted)] bg-transparent',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
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

export default Badge;
