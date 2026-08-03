"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DailyPoint } from "@/lib/stats";

export function VisitsChart({ data }: { data: DailyPoint[] }) {
  const formatted = data.map((point) => ({
    ...point,
    label: point.date.slice(5), // MM-JJ
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={(label, payload) => payload[0]?.payload.date ?? label}
            formatter={(value) => [value, "Visites"]}
          />
          <Line
            type="monotone"
            dataKey="visits"
            stroke="var(--brand-primary)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
