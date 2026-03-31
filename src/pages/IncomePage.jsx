import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import TransactionCard from "../components/TransactionCard";
import PieChartComponent from "../components/charts/PieChartComponent";
import EmojiPicker from "../components/EmojiPicker";

const EMPTY_FORM = { icon: "💰", source: "", amount: "", date: "", description: "" };

export default function IncomePage() {
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fetchIncomes = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(API_PATHS.INCOME.GET_ALL);
      if (data.success) setIncomes(data.data);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const validate = () => {
    const e = {};
    if (!form.source.trim()) e.source = "Source is required";
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
      const { data } = await axiosInstance.post(API_PATHS.INCOME.ADD, {
        ...form, amount: Number(form.amount),
      });
      if (data.success) {
        setForm(EMPTY_FORM);
        setErrors({});
        fetchIncomes();
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to add income" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await axiosInstance.delete(API_PATHS.INCOME.DELETE(id));
    setIncomes((prev) => prev.filter((i) => i._id !== id));
  };

  const handleDownload = () => {
    const token = localStorage.getItem("token");
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
    window.open(`${base}${API_PATHS.INCOME.DOWNLOAD_EXCEL}?token=${token}`, "_blank");
  };

  // Build pie data from incomes
  const pieData = incomes.reduce((acc, inc) => {
    const existing = acc.find((a) => a.name === inc.source);
    if (existing) existing.value += inc.amount;
    else acc.push({ name: inc.source, value: inc.amount });
    return acc;
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Income</h1>
          <p className="text-gray-400 text-sm mt-1">Track your income sources</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Income Form */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Add Income</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Icon picker */}
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Icon</label>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(true)}
                className="neu-input w-full px-4 py-3 text-sm flex items-center gap-3 text-left hover:border-violet-400 transition-colors"
              >
                <span className="text-2xl">{form.icon}</span>
                <span className="text-gray-400">Click to choose icon</span>
                <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showEmojiPicker && (
                <EmojiPicker
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e })}
                  onClose={() => setShowEmojiPicker(false)}
                />
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Source</label>
              <input
                type="text"
                className="neu-input w-full px-4 py-3 text-sm"
                placeholder="e.g. Salary, Freelance"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
              {errors.source && <p className="text-red-500 text-xs mt-1">{errors.source}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="neu-input w-full px-4 py-3 text-sm"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Date</label>
                <input
                  type="date"
                  className="neu-input w-full px-4 py-3 text-sm"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1.5">Description (optional)</label>
              <textarea
                className="neu-input w-full px-4 py-3 text-sm resize-none"
                rows={2}
                placeholder="Add a note..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {errors.submit && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              {loading ? "Adding..." : "Add Income"}
            </button>
          </form>
        </div>

        {/* Right: Chart + List */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Income Overview</h2>
            <PieChartComponent data={pieData} />
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Income List</h2>
            {fetching ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 bg-gray-100 rounded" />
                      <div className="h-2.5 w-16 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-14 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : !incomes.length ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <span className="text-3xl mb-2">💸</span>
                <p className="text-sm text-gray-400">No income records yet</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {incomes.map((inc) => (
                  <TransactionCard key={inc._id} item={inc} type="income" onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
