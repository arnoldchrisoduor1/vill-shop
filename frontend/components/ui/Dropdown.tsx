'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, label, placeholder = 'Select...', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-[var(--radius)] border border-[var(--color-border)]',
          'bg-white px-3 py-2 text-sm',
          'focus:outline-none focus:border-[var(--color-primary)]',
        )}
      >
        <span className={cn(!selected && 'text-[var(--color-text-muted)]')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-[var(--color-text-muted)] transition-transform', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-white shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => { onChange(option.value); setIsOpen(false); }}
                  className={cn(
                    'w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-background)] transition-colors',
                    option.value === value && 'text-[var(--color-primary)] font-medium',
                  )}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
