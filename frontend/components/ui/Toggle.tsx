'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({ checked, onChange, label, disabled, className }: ToggleProps) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg"
          style={{ x: checked ? 20 : 0 }}
        />
      </button>
      {label && <span className="text-sm text-[var(--color-text)]">{label}</span>}
    </label>
  );
}

export default Toggle;
