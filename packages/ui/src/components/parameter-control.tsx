import { cn } from '../lib/utils';
import { Slider } from './slider';
import { NumericInput } from './numeric-input';

export interface ParameterControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  precision?: number;
  description?: string;
}

function ParameterControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
  disabled,
  className,
  precision,
  description,
}: ParameterControlProps) {
  return (
    <div className={cn('space-y-1.5 p-2 rounded-lg bg-zinc-900/40 border border-zinc-800/80', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 block truncate" title={label}>
            {label}
          </label>
          {description && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
        <NumericInput
          label={label}
          showLabel={false}
          value={value}
          min={min}
          max={max}
          step={step}
          unit={unit}
          onChange={onChange}
          disabled={disabled}
          precision={precision}
          className="w-32 shrink-0"
        />
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        disabled={disabled}
        showValue={false}
      />
    </div>
  );
}

export { ParameterControl };

