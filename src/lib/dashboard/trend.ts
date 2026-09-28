export type Trend = {
  percent: number | null;
  direction: "up" | "down" | "flat";
};

export function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    if (current === 0) return { percent: null, direction: "flat" };
    return { percent: null, direction: "up" };
  }
  const percent = Math.round(((current - previous) / previous) * 100);
  const direction = percent > 0 ? "up" : percent < 0 ? "down" : "flat";
  return { percent, direction };
}
