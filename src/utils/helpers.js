export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatShortDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Travel",
  "Utilities",
  "Personal Care",
  "Subscriptions",
  "Other",
];

export const ICON_OPTIONS = ["💰", "💵", "💳", "🏦", "📈", "🏠", "🚗", "🍔", "🎮", "✈️", "💊", "🛒", "📚", "⚡", "💼", "🎯"];

export const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
  "#a855f7", "#3b82f6",
];
