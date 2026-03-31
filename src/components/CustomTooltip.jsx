import React from "react";
import { formatCurrency, formatShortDate } from "../utils/helpers";

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-violet-100">
      <p className="text-xs text-gray-400 mb-1">{label ? formatShortDate(label) : ""}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || "#7c3aed" }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}
