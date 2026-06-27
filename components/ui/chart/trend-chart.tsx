import { ChartFrame, type ChartDatum } from "./chart-frame";

/**
 * Velora 3.0 — Trend / sparkline chart (Phase 2B, CH1). Dependency-free SVG
 * line + area for time-series (e.g. reports created vs resolved over days).
 * Supports one or two comparative series. Token-colored, accessible.
 */
interface Series {
  name: string;
  points: number[];
  /** CSS color; defaults to brand. */
  color?: string;
}

interface TrendChartProps {
  title?: string;
  description?: string;
  ariaLabel: string;
  /** X-axis labels (e.g. day names). */
  labels: string[];
  series: Series[];
  className?: string;
  height?: number;
}

const W = 320;

function buildPath(points: number[], max: number, h: number, pad = 4) {
  const n = points.length;
  if (n === 0) return { line: "", area: "" };
  const stepX = n > 1 ? (W - pad * 2) / (n - 1) : 0;
  const y = (v: number) => h - pad - (max > 0 ? (v / max) * (h - pad * 2) : 0);
  const coords = points.map((v, i) => [pad + i * stepX, y(v)] as const);
  const line = coords
    .map(
      ([x, yy], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yy.toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${(pad + (n - 1) * stepX).toFixed(1)},${h - pad} L${pad},${h - pad} Z`;
  return { line, area };
}

export function TrendChart({
  title,
  description,
  ariaLabel,
  labels,
  series,
  className,
  height = 120,
}: TrendChartProps) {
  const max = series.reduce((m, s) => Math.max(m, ...s.points), 0) || 1;

  const tableData: ChartDatum[] = labels.map((label, i) => ({
    label,
    value: series[0]?.points[i] ?? 0,
  }));

  return (
    <ChartFrame
      title={title}
      description={description}
      ariaLabel={ariaLabel}
      data={tableData}
      valueLabel={series[0]?.name ?? "Value"}
      className={className}
      legend={
        series.length > 1 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
            {series.map((s, i) => (
              <li key={s.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: s.color ?? "hsl(var(--brand))" }}
                  aria-hidden
                />
                <span className="text-muted-foreground">{s.name}</span>
              </li>
            ))}
          </ul>
        ) : undefined
      }
    >
      <svg
        width="100%"
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {series.map((s, i) => {
          const color = s.color ?? "hsl(var(--brand))";
          const { line, area } = buildPath(s.points, max, height);
          const gid = `trend-grad-${i}`;
          return (
            <g key={s.name}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
              </defs>
              {i === 0 && <path d={area} fill={`url(#${gid})`} />}
              <path
                d={line}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        {labels.map((l, i) => (
          <span key={`${l}-${i}`}>{l}</span>
        ))}
      </div>
    </ChartFrame>
  );
}
