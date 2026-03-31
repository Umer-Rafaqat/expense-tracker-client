import React, { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import PieChartComponent from "../components/charts/PieChartComponent";
import EmojiPicker from "../components/EmojiPicker";
import { EXPENSE_CATEGORIES, formatCurrency } from "../utils/helpers";

const EMPTY_FORM = { icon: "💳", category: "", amount: "", date: "", description: "" };
const TABS = ["Daily", "Monthly", "Calendar", "Yearly"];

const FILTER_OPTIONS = [
  { key: "name", label: "Name", icon: "Aa" },
  { key: "amount", label: "Amount", icon: "#" },
  { key: "category", label: "Category", icon: "🏷" },
  { key: "date", label: "Date", icon: "📅" },
  { key: "notes", label: "Notes", icon: "≡" },
];
const SORT_OPTIONS = [
  { key: "name", label: "Name", icon: "Aa" },
  { key: "amount", label: "Amount", icon: "#" },
  { key: "category", label: "Category", icon: "🏷" },
  { key: "date", label: "Date", icon: "📅" },
  { key: "notes", label: "Notes", icon: "≡" },
];

function groupBy(expenses, mode) {
  const map = {};
  expenses.forEach((exp) => {
    const d = new Date(exp.date);
    let key;
    if (mode === "Daily") key = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    else if (mode === "Monthly") key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    else key = String(d.getFullYear());
    if (!map[key]) map[key] = { label: key, total: 0, items: [], rawDate: d };
    map[key].total += exp.amount;
    map[key].items.push(exp);
  });
  return Object.values(map).sort((a, b) => b.rawDate - a.rawDate);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState("Monthly");
  const [collapsed, setCollapsed] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [sortSearch, setSortSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeSort, setActiveSort] = useState("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL);
      if (data.success) setExpenses(data.data);
    } finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.category) e.category = "Category is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Valid amount required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(API_PATHS.EXPENSE.ADD, { ...form, amount: Number(form.amount) });
      if (data.success) { setForm(EMPTY_FORM); setErrors({}); fetchExpenses(); }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to add expense" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    await axiosInstance.delete(API_PATHS.EXPENSE.DELETE(id));
    setExpenses((prev) => prev.filter((e) => e._id !== id));
  };

  const handleDownload = () => {
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    window.open(`${base}${API_PATHS.EXPENSE.DOWNLOAD_EXCEL}?token=${token}`, "_blank");
  };

  const toggleCollapse = (key) => setCollapsed((p) => ({ ...p, [key]: !p[key] }));

  // Sort + filter expenses
  const processedExpenses = [...expenses]
    .filter((exp) => {
      if (!activeFilter) return true;
      if (activeFilter === "name") return exp.category.toLowerCase().includes(filterSearch.toLowerCase());
      if (activeFilter === "category") return exp.category.toLowerCase().includes(filterSearch.toLowerCase());
      if (activeFilter === "amount") return String(exp.amount).includes(filterSearch);
      if (activeFilter === "notes") return (exp.description || "").toLowerCase().includes(filterSearch.toLowerCase());
      return true;
    })
    .sort((a, b) => {
      let va, vb;
      if (activeSort === "amount") { va = a.amount; vb = b.amount; }
      else if (activeSort === "name" || activeSort === "category") { va = a.category; vb = b.category; }
      else if (activeSort === "notes") { va = a.description || ""; vb = b.description || ""; }
      else { va = new Date(a.date); vb = new Date(b.date); }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

  const grouped = groupBy(processedExpenses, activeTab === "Calendar" ? "Daily" : activeTab);
  const pieData = expenses.reduce((acc, exp) => {
    const ex = acc.find((a) => a.name === exp.category);
    if (ex) ex.value += exp.amount; else acc.push({ name: exp.category, value: exp.amount });
    return acc;
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-400 text-sm mt-1">Track your spending</p>
        </div>
        <button onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-violet-600 border border-violet-200 hover:bg-violet-50 transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Excel
        </button>
      </div>

      {/* Form + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Add Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Emoji picker trigger */}
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Icon</label>
              <button type="button" onClick={() => setShowEmojiPicker(true)}
                className="neu-input w-full px-4 py-3 text-sm flex items-center gap-3 text-left hover:border-violet-400 transition-colors">
                <span className="text-2xl">{form.icon}</span>
                <span className="text-gray-400">Click to choose icon</span>
                <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showEmojiPicker && (
                <EmojiPicker value={form.icon} onChange={(e) => setForm({ ...form, icon: e })} onClose={() => setShowEmojiPicker(false)} />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Category</label>
              <select className="neu-input w-full px-4 py-3 text-sm" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {EXPENSE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Amount ($)</label>
                <input type="number" min="0" step="0.01" className="neu-input w-full px-4 py-3 text-sm"
                  placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Date</label>
                <input type="date" className="neu-input w-full px-4 py-3 text-sm" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Notes (optional)</label>
              <textarea className="neu-input w-full px-4 py-3 text-sm resize-none" rows={2}
                placeholder="Add a note..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">{errors.submit}</p>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
              {loading ? "Adding..." : "Add Expense"}
            </button>
          </form>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Expense Overview</h2>
          <PieChartComponent data={pieData} />
        </div>
      </div>

      {/* Table / Calendar section */}
      <div className="glass rounded-2xl overflow-visible">
        {/* Tabs + toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}>
                <TabIcon tab={tab} />
                {tab}
              </button>
            ))}
          </div>

          {/* Filter / Sort / Search toolbar */}
          <div className="flex items-center gap-1">
            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button onClick={() => { setShowFilter((p) => !p); setShowSort(false); }}
                className={`p-2 rounded-lg transition-colors ${showFilter ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-100"}`} title="Filter">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
              </button>
              {showFilter && <DropdownPanel title="Filter by..." options={FILTER_OPTIONS} active={activeFilter}
                onSelect={(k) => { setActiveFilter(k); setFilterSearch(""); }}
                search={filterSearch} onSearch={setFilterSearch} />}
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button onClick={() => { setShowSort((p) => !p); setShowFilter(false); }}
                className={`p-2 rounded-lg transition-colors ${showSort ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-100"}`} title="Sort">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
              {showSort && <DropdownPanel title="Sort by..." options={SORT_OPTIONS} active={activeSort}
                onSelect={(k) => { setActiveSort(k); setSortAsc((p) => activeSort === k ? !p : false); }}
                search={sortSearch} onSearch={setSortSearch} />}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === "Calendar" ? (
          <CalendarView expenses={processedExpenses} calendarDate={calendarDate} setCalendarDate={setCalendarDate} />
        ) : fetching ? (
          <SkeletonRows />
        ) : !processedExpenses.length ? (
          <EmptyState />
        ) : (
          <GroupedTable grouped={grouped} collapsed={collapsed} toggleCollapse={toggleCollapse}
            onDelete={handleDelete} mode={activeTab} />
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function TabIcon({ tab }) {
  if (tab === "Daily") return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  if (tab === "Monthly") return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  if (tab === "Calendar") return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DropdownPanel({ title, options, active, onSelect, search, onSearch }) {
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 z-50 overflow-hidden animate-fade-in">
      <div className="p-3">
        <input autoFocus type="text" value={search} onChange={(e) => onSearch(e.target.value)}
          placeholder={title}
          className="w-full px-3 py-2 text-sm rounded-xl bg-gray-800 border-2 border-blue-500 text-white placeholder-gray-500 outline-none" />
      </div>
      <div className="pb-2">
        {filtered.map((opt) => (
          <button key={opt.key} onClick={() => onSelect(opt.key)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
              active === opt.key ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-800"
            }`}>
            <span className="w-5 text-center font-bold text-gray-400">{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GroupedTable({ grouped, collapsed, toggleCollapse, onDelete, mode }) {
  return (
    <div>
      {grouped.map((group) => (
        <div key={group.label}>
          {/* Group header */}
          <button onClick={() => toggleCollapse(group.label)}
            className="w-full flex items-center gap-2 px-5 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left">
            <svg className={`w-3 h-3 text-gray-500 transition-transform duration-200 flex-shrink-0 ${collapsed[group.label] ? "-rotate-90" : ""}`}
              fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{group.label}</span>
            <span className="text-sm text-gray-400">{formatCurrency(group.total)}</span>
          </button>

          {!collapsed[group.label] && (
            <>
              {/* Column headers — only for Yearly/Monthly */}
              {(mode === "Yearly" || mode === "Monthly") && (
                <div className="grid grid-cols-12 gap-2 px-5 py-2 border-b border-gray-100 bg-white">
                  <ColHeader className="col-span-2" icon="📅">Date</ColHeader>
                  <ColHeader className="col-span-3" icon="Aa">Name</ColHeader>
                  <ColHeader className="col-span-2" icon="#">Amount</ColHeader>
                  <ColHeader className="col-span-3" icon="🏷">Category</ColHeader>
                  <ColHeader className="col-span-2" icon="≡">Notes</ColHeader>
                </div>
              )}
              {group.items.map((exp) =>
                mode === "Daily"
                  ? <DailyRow key={exp._id} exp={exp} onDelete={onDelete} />
                  : <TableRow key={exp._id} exp={exp} onDelete={onDelete} />
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ColHeader({ children, icon, className }) {
  return (
    <div className={`${className} flex items-center gap-1.5 text-xs text-gray-400 font-medium`}>
      <span>{icon}</span>{children}
    </div>
  );
}

// Daily view row — name on left, category+amount+date on right
function DailyRow({ exp, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className={`group flex items-center justify-between px-5 py-3 border-b border-gray-50 hover:bg-violet-50/30 transition-all duration-200 ${deleting ? "opacity-0 scale-y-0" : ""}`}
      style={{ transition: "opacity 0.25s, transform 0.25s" }}>
      <div className="flex items-center gap-2">
        <span className="text-base">{exp.icon || "💳"}</span>
        <span className="text-sm font-medium text-gray-700">{exp.category}</span>
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="text-xs">{exp.icon || "💳"}</span>
          <span className="font-medium text-gray-700">{exp.category}</span>
        </span>
        <span className="font-semibold text-gray-800">{formatCurrency(exp.amount)}</span>
        <span>{new Date(exp.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        <button onClick={async () => { setDeleting(true); await onDelete(exp._id); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Monthly/Yearly table row
function TableRow({ exp, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <div className={`group grid grid-cols-12 gap-2 px-5 py-3 border-b border-gray-50 hover:bg-violet-50/30 transition-all duration-200 items-center ${deleting ? "opacity-0 scale-y-0" : ""}`}
      style={{ transition: "opacity 0.25s, transform 0.25s" }}>
      <div className="col-span-2 text-sm text-gray-500">
        {new Date(exp.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </div>
      <div className="col-span-3 flex items-center gap-2">
        <span className="text-base">{exp.icon || "💳"}</span>
        <span className="text-sm font-medium text-gray-700">{exp.category}</span>
      </div>
      <div className="col-span-2 text-sm font-semibold text-gray-800">{formatCurrency(exp.amount)}</div>
      <div className="col-span-3">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
          {exp.icon || "💳"} {exp.category}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-between">
        <span className="text-sm text-gray-400 truncate">{exp.description || "—"}</span>
        <button onClick={async () => { setDeleting(true); await onDelete(exp._id); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-all flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Calendar view
function CalendarView({ expenses, calendarDate, setCalendarDate }) {
  const today = new Date();
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map expenses to day numbers
  const expByDay = {};
  expenses.forEach((exp) => {
    const d = new Date(exp.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!expByDay[day]) expByDay[day] = [];
      expByDay[day].push(exp);
    }
  });

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));
  const goToday = () => setCalendarDate(new Date());

  const monthLabel = calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Build grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div className="p-5">
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-800">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={goToday}
            className="px-3 py-1 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-l border-t border-gray-100">
        {cells.map((day, i) => (
          <div key={i}
            className={`min-h-[90px] border-r border-b border-gray-100 p-1.5 ${day ? "hover:bg-violet-50/30 transition-colors" : "bg-gray-50/50"}`}>
            {day && (
              <>
                <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1 ${
                  isToday(day) ? "bg-red-400 text-white" : "text-gray-600"
                }`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {(expByDay[day] || []).slice(0, 2).map((exp, j) => (
                    <div key={j} className="text-xs bg-violet-100 text-violet-700 rounded px-1 py-0.5 truncate">
                      {exp.icon} {formatCurrency(exp.amount)}
                    </div>
                  ))}
                  {(expByDay[day] || []).length > 2 && (
                    <div className="text-xs text-gray-400">+{expByDay[day].length - 2} more</div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="p-5 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-4 w-40 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-28 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-4xl mb-3">🧾</span>
      <p className="text-sm">No expense records yet</p>
    </div>
  );
}

// useState needed in row components (imported at top)
