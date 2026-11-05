const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Parses a "YYYY-MM" key into its UTC range, or null if it isn't one. */
export function parseMonthKey(value: string | undefined) {
  const match = value?.match(MONTH_KEY);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const start = new Date(Date.UTC(year, monthIndex, 1));

  return {
    key: match[0],
    label: monthLabel(start),
    start,
    end: new Date(Date.UTC(year, monthIndex + 1, 1)),
  };
}

/** Counts timestamps per UTC calendar month, newest month first. */
export function groupByMonth(timestamps: string[]) {
  const counts = new Map<string, number>();
  for (const timestamp of timestamps) {
    const key = new Date(timestamp).toISOString().slice(0, 7);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, count]) => ({
      key,
      count,
      label: monthLabel(new Date(`${key}-01T00:00:00Z`)),
    }));
}
