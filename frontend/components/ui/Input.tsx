import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm',
            'placeholder:text-[var(--color-text-muted)]',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
            'disabled:bg-[var(--color-background)] disabled:cursor-not-allowed',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {helperText && !error && <p className="text-xs text-[var(--color-text-muted)]">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input };
export default Input;
