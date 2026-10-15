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
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
          {description && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <NumericInput
          label={label}
          value={value}
          min={min}
          max={max}
          step={step}
          unit={unit}
          onChange={onChange}
          disabled={disabled}
          precision={precision}
          className="w-28"
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

