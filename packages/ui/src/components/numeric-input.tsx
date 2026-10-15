'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface NumericInputProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
  precision?: number;
}

const NumericInput = React.forwardRef<HTMLDivElement, NumericInputProps>(
  ({ value, min, max, step = 1, onChange, label, unit, disabled, className, precision }, ref) => {
    const [localValue, setLocalValue] = React.useState(value.toString());
    const [isFocused, setIsFocused] = React.useState(false);

    // Sync from props when not focused
    React.useEffect(() => {
      if (!isFocused) {
        const displayPrecision = precision ?? (step < 1 ? Math.ceil(-Math.log10(step)) : 0);
        setLocalValue(value.toFixed(displayPrecision));
      }
    }, [value, isFocused, step, precision]);

    const commitValue = (raw: string) => {
      const parsed = parseFloat(raw);
      if (!Number.isFinite(parsed)) return;

      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    };

    const handleBlur = () => {
      setIsFocused(false);
      commitValue(localValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        commitValue(localValue);
        (e.target as HTMLInputElement).blur();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(Math.min(max ?? Infinity, value + step));
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(Math.max(min ?? -Infinity, value - step));
      }
    };

    return (
      <div ref={ref} className={cn('space-y-1', className)}>
        {label && (
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <input
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'w-full rounded-md border bg-white px-3 py-1.5 text-sm font-mono tabular-nums',
              'border-zinc-300 text-zinc-900 placeholder:text-zinc-400',
              'focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500',
              'dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100',
              'dark:focus:border-indigo-400 dark:focus:ring-indigo-400',
              'disabled:cursor-not-allowed disabled:opacity-50',
              unit && 'pr-12',
            )}
            aria-label={label}
          />
          {unit && (
            <span className="absolute right-3 text-xs text-zinc-400 dark:text-zinc-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
    );
  },
);
NumericInput.displayName = 'NumericInput';

export { NumericInput };

