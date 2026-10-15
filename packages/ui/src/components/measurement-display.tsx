import { cn } from '../lib/utils';

export interface MeasurementDisplayProps {
  label: string;
  value: number;
  unit: string;
  precision?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
}

function MeasurementDisplay({
  label,
  value,
  unit,
  precision = 2,
  className,
  size = 'md',
  highlight = false,
}: MeasurementDisplayProps) {
  const formattedValue = Number.isFinite(value) ? value.toFixed(precision) : '—';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const valueSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-md px-3 py-2',
        highlight
          ? 'bg-indigo-50 dark:bg-indigo-950/50'
          : 'bg-zinc-50 dark:bg-zinc-900',
        className,
      )}
    >
      <span
        className={cn(
          'font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider',
          sizeClasses[size],
          size === 'sm' && 'text-[0.65rem]',
        )}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-mono font-semibold tabular-nums text-zinc-900 dark:text-zinc-100',
            valueSizeClasses[size],
          )}
        >
          {formattedValue}
        </span>
        <span
          className={cn(
            'text-zinc-400 dark:text-zinc-500',
            sizeClasses[size],
          )}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

export { MeasurementDisplay };

