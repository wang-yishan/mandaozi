interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  className?: string;
  indicatorClassName?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  className = "",
  indicatorClassName = "",
  trackClassName = "",
}: ProgressBarProps) {
  const safeMax = max <= 0 ? 100 : max;
  const clamped = Math.min(safeMax, Math.max(0, value));
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.round(clamped)}
      className={`h-2.5 w-full overflow-hidden rounded-full bg-[var(--chart-track)] ${trackClassName} ${className}`}
    >
      <div
        className={`h-full rounded-full bg-[var(--primary)] transition-[width] duration-300 ${indicatorClassName}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
