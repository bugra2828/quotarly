"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const TOKENS = {
  brand: "#4f7dfd",
  press: "#34d399",
  rule: "rgba(255,255,255,0.1)",
  inkSoft: "#9a9aa8",
  surface: "#121319",
  ink: "#f2f2f5",
};

function formatDay(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: TOKENS.surface,
        border: `1px solid ${TOKENS.rule}`,
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <div style={{ color: TOKENS.inkSoft, marginBottom: 2 }}>
        {label ? formatDay(label) : ""}
      </div>
      <div style={{ color: TOKENS.ink, fontWeight: 600 }}>
        {payload[0]?.value} {unit}
      </div>
    </div>
  );
}

export function PitchesBarChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={TOKENS.rule}
          strokeDasharray="0"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fill: TOKENS.inkSoft, fontSize: 11 }}
          axisLine={{ stroke: TOKENS.rule }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          content={<ChartTooltip unit="sent" />}
        />
        <Bar dataKey="count" fill={TOKENS.brand} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BacklinksAreaChart({
  data,
}: {
  data: { date: string; count: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid
          vertical={false}
          stroke={TOKENS.rule}
          strokeDasharray="0"
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fill: TOKENS.inkSoft, fontSize: 11 }}
          axisLine={{ stroke: TOKENS.rule }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis hide allowDecimals={false} />
        <Tooltip
          cursor={{ stroke: TOKENS.rule }}
          content={<ChartTooltip unit="won" />}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={TOKENS.press}
          strokeWidth={2}
          fill={TOKENS.press}
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
