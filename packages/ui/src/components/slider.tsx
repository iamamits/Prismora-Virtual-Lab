'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
  showValue?: boolean;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ value, min, max, step = 1, onChange, label, unit, disabled, className, showValue = true }, ref) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (Number.isFinite(newValue)) {
        onChange(newValue);
      }
    };

    return (
      <div ref={ref} className={cn('space-y-1.5', className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <label className="font-medium text-zinc-700 dark:text-zinc-300">
                {label}
              </label>
            )}
            {showValue && (
              <span className="font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {value.toFixed(step < 1 ? Math.ceil(-Math.log10(step)) : 0)}
                {unit && <span className="ml-0.5 text-zinc-400 dark:text-zinc-500">{unit}</span>}
              </span>
            )}
          </div>
        )}
        <div className="relative h-5 flex items-center">
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="absolute h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-75"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="absolute inset-x-0 h-5 w-full cursor-pointer appearance-none bg-transparent
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-500
              [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-500
              disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={label}
          />
        </div>
      </div>
    );
  },
);
Slider.displayName = 'Slider';

export { Slider };

