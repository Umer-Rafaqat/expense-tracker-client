import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import CustomTooltip from "../CustomTooltip";
import { formatShortDate } from "../../utils/helpers";

export default function LineChartComponent({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#lineGrad)"
          dot={{ fill: "#10b981", r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#10b981" }}
          name="Income"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
