import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={cn(
            'w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-white px-3 py-2 text-sm resize-vertical',
            'placeholder:text-[var(--color-text-muted)]',
            'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
            'disabled:bg-[var(--color-background)] disabled:cursor-not-allowed',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export { Textarea };
export default Textarea;
