/**
 * Velora 3.0 — Chart primitives (Phase 2B, CH1). Dependency-free, token-colored,
 * accessible SVG charts. One import surface for analytics surfaces.
 */
export {
  ChartFrame,
  SERIES_FILL,
  SERIES_HSL,
  type ChartDatum,
} from "./chart-frame";
export { BarChart, categoryBarData } from "./bar-chart";
export { DonutChart } from "./donut-chart";
export { TrendChart } from "./trend-chart";
