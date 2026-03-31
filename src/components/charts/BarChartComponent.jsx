import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import CustomTooltip from "../CustomTooltip";
import { formatShortDate } from "../../utils/helpers";

export default function BarChartComponent({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
        <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
}
