import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CATEGORY_COLORS } from "../../utils/helpers";
import { formatCurrency } from "../../utils/helpers";

const CustomLabel = ({ cx, cy, total }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" fill="#9ca3af" fontSize={12}>Total</text>
    <text x={cx} y={cy + 12} textAnchor="middle" fill="#1a1a2e" fontSize={15} fontWeight="600">
      {formatCurrency(total)}
    </text>
  </>
);

export default function PieChartComponent({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No data yet</div>
  );

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
          <CustomLabel cx="50%" cy="50%" total={total} />
        </Pie>
        <Tooltip
          formatter={(val, name) => [formatCurrency(val), name]}
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #ede9fe",
            borderRadius: "12px",
            color: "#1a1a2e",
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(124,58,237,0.1)",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span style={{ color: "#6b7280", fontSize: "12px" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
