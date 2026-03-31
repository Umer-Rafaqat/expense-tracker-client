import React, { useState } from "react";
import { formatCurrency, formatDate } from "../utils/helpers";

export default function TransactionCard({ item, type, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(item._id);
  };

  const label = type === "income" ? item.source : item.category;

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all duration-200 ${
        deleting ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: type === "income" ? "rgba(16,185,129,0.1)" : "rgba(124,58,237,0.1)" }}>
        {item.icon || (type === "income" ? "💰" : "💳")}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{label}</p>
        <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${type === "income" ? "text-emerald-500" : "text-red-500"}`}>
          {type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
        </span>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all duration-200"
            aria-label="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
