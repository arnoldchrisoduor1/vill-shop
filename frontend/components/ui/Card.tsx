'use client';

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({ children, className, hover = false, padding = 'md', onClick }: CardProps) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(0,181,184,0.15)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        onClick={onClick}
        className={cn(
          'bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)] cursor-pointer',
          paddings[padding],
          className,
        )}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[var(--color-surface)] rounded-[var(--radius)] border border-[var(--color-border)]',
        paddings[padding],
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
