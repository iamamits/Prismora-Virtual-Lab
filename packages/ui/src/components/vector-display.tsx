import { cn } from '../lib/utils';

export interface VectorDisplayProps {
  label: string;
  x: number;
  y: number;
  unit: string;
  color?: string;
  precision?: number;
  className?: string;
  showMagnitude?: boolean;
}

function VectorDisplay({
  label,
  x,
  y,
  unit,
  color = '#3b82f6',
  precision = 2,
  className,
  showMagnitude = true,
}: VectorDisplayProps) {
  const magnitude = Math.sqrt(x * x + y * y);
  const angle = Math.atan2(y, x) * (180 / Math.PI);

  const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(precision) : '—');

  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 space-y-1',
        'border-zinc-200 dark:border-zinc-700',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs font-mono tabular-nums">
        <div className="text-zinc-500 dark:text-zinc-400">
          x: <span className="text-zinc-900 dark:text-zinc-100">{fmt(x)}</span>
          <span className="ml-0.5 text-zinc-400 dark:text-zinc-500">{unit}</span>
        </div>
        <div className="text-zinc-500 dark:text-zinc-400">
          y: <span className="text-zinc-900 dark:text-zinc-100">{fmt(y)}</span>
          <span className="ml-0.5 text-zinc-400 dark:text-zinc-500">{unit}</span>
        </div>
      </div>
      {showMagnitude && (
        <div className="flex gap-3 text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
          <span>
            |v| = <span className="text-zinc-900 dark:text-zinc-100">{fmt(magnitude)}</span>
            <span className="ml-0.5">{unit}</span>
          </span>
          <span>
            θ = <span className="text-zinc-900 dark:text-zinc-100">{fmt(angle)}</span>
            <span className="ml-0.5">°</span>
          </span>
        </div>
      )}
    </div>
  );
}

export { VectorDisplay };

