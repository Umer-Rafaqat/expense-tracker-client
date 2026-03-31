import React from "react";
import { formatCurrency } from "../utils/helpers";

export default function SummaryCard({ icon, label, amount, gradient, trend, trendValue }) {
  return (
    <div
      className="glass rounded-2xl p-5 animate-fade-in-up hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default"
      style={{ opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
          style={{ background: gradient }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trendValue || trend)}%
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{formatCurrency(amount)}</p>
    </div>
  );
}
