import { ChartFrame, SERIES_HSL, type ChartDatum } from "./chart-frame";

/**
 * Velora 3.0 — Donut chart (Phase 2B, CH1). Dependency-free SVG using stroked
 * circle arcs (stroke-dasharray). Token-colored, accessible. Ideal for
 * part-to-whole breakdowns (status mix, severity mix).
 */
interface DonutSlice extends ChartDatum {
  /** Optional explicit color (CSS color). Falls back to the series palette. */
  color?: string;
}

interface DonutChartProps {
  title?: string;
  description?: string;
  ariaLabel: string;
  data: DonutSlice[];
  valueLabel?: string;
  /** Big number shown in the center; defaults to the total. */
  centerValue?: React.ReactNode;
  centerLabel?: string;
  className?: string;
}

const SIZE = 132;
const STROKE = 18;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function DonutChart({
  title,
  description,
  ariaLabel,
  data,
  valueLabel = "Count",
  centerValue,
  centerLabel,
  className,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;

  const slices = data.map((d, i) => {
    const frac = total > 0 ? d.value / total : 0;
    const len = frac * C;
    const seg = {
      color: d.color ?? SERIES_HSL[i % SERIES_HSL.length],
      dash: `${len} ${C - len}`,
      rotation: (offset / C) * 360,
      pct: Math.round(frac * 100),
      ...d,
    };
    offset += len;
    return seg;
  });

  return (
    <ChartFrame
      title={title}
      description={description}
      ariaLabel={ariaLabel}
      data={data}
      valueLabel={valueLabel}
      className={className}
      legend={
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-semibold tabular-nums">{s.value}</span>
            </li>
          ))}
        </ul>
      }
    >
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              className="stroke-muted"
              strokeWidth={STROKE}
            />
            {total > 0 &&
              slices.map((s) => (
                <circle
                  key={s.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={s.dash}
                  strokeDashoffset={-(s.rotation / 360) * C}
                  className="transition-all"
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-metric leading-none">
              {centerValue ?? total}
            </span>
            {centerLabel && (
              <span className="text-xs text-muted-foreground">
                {centerLabel}
              </span>
            )}
          </div>
        </div>
      </div>
    </ChartFrame>
  );
}
