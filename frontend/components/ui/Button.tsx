'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  name?: string;
  value?: string;
  'aria-label'?: string;
}

const variants = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)] focus-visible:ring-[var(--color-secondary)]',
  outline: 'border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-background)] focus-visible:ring-[var(--color-primary)]',
  ghost: 'text-[var(--color-text)] hover:bg-[var(--color-background)] focus-visible:ring-[var(--color-primary)]',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className, children, onClick, type = 'button', form, name, value, 'aria-label': ariaLabel }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        disabled={disabled || isLoading}
        type={type}
        form={form}
        name={name}
        value={value}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export { Button };
export default Button;
