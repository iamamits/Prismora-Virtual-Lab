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
  showLabel?: boolean;
  unit?: string;
  disabled?: boolean;
  className?: string;
  precision?: number;
}

const NumericInput = React.forwardRef<HTMLDivElement, NumericInputProps>(
  (
    {
      value,
      min,
      max,
      step = 1,
      onChange,
      label,
      showLabel = true,
      unit,
      disabled,
      className,
      precision,
    },
    ref,
  ) => {
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
        {showLabel && label && (
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center rounded-md border overflow-hidden transition-colors bg-white dark:bg-zinc-900',
            'border-zinc-300 dark:border-zinc-700',
            'focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500',
            'dark:focus-within:border-indigo-400 dark:focus-within:ring-indigo-400',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
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
              'flex-1 min-w-0 bg-transparent px-2.5 py-1 text-xs font-mono font-medium tabular-nums text-right',
              'text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none',
              'disabled:cursor-not-allowed',
            )}
            aria-label={label}
          />
          {unit && (
            <span className="shrink-0 px-2 py-1 text-[11px] font-mono font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/90 border-l border-zinc-200 dark:border-zinc-700 select-none">
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

