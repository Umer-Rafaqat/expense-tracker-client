import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import SummaryCard from "../components/SummaryCard";
import TransactionCard from "../components/TransactionCard";
import PieChartComponent from "../components/charts/PieChartComponent";
import BarChartComponent from "../components/charts/BarChartComponent";
import LineChartComponent from "../components/charts/LineChartComponent";

const SkeletonCard = () => (
  <div className="glass rounded-2xl p-5 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-slate-700 mb-4" />
    <div className="h-3 w-20 bg-slate-700 rounded mb-2" />
    <div className="h-6 w-32 bg-slate-700 rounded" />
  </div>
);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(API_PATHS.DASHBOARD.GET)
      .then((res) => { if (res.data.success) setData(res.data.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Your financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <SummaryCard icon="💰" label="Total Balance" amount={data?.totalBalance}
              gradient="linear-gradient(135deg, #7c3aed, #a78bfa)" />
            <SummaryCard icon="📈" label="Total Income" amount={data?.totalIncome}
              gradient="linear-gradient(135deg, #10b981, #34d399)" />
            <SummaryCard icon="📉" label="Total Expenses" amount={data?.totalExpenses}
              gradient="linear-gradient(135deg, #ef4444, #f87171)" />
          </>
        )}
      </div>

      {/* Pie + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
          <PieChartComponent data={data?.categoryBreakdown || []} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-slate-700 rounded" />
                    <div className="h-2.5 w-20 bg-slate-700 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          ) : !data?.recentTransactions?.length ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <span className="text-4xl mb-2">📭</span>
              <p className="text-sm text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {data.recentTransactions.map((t) => (
                <TransactionCard key={t._id} item={t} type={t.type} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart + Expense Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Last 30 Days Expenses</h2>
          <BarChartComponent data={data?.expensesByDate || []} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Expense Details</h2>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {(data?.categoryBreakdown || []).map((cat, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <span className="text-sm text-gray-600">{cat.name}</span>
                <span className="text-sm font-semibold text-red-400">
                  ${cat.value.toLocaleString()}
                </span>
              </div>
            ))}
            {!data?.categoryBreakdown?.length && (
              <p className="text-gray-400 text-sm text-center py-8">No expense data</p>
            )}
          </div>
        </div>
      </div>

      {/* Line Chart + Income Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Last 60 Days Income</h2>
          <LineChartComponent data={data?.incomeByDate || []} />
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Income Details</h2>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {(data?.incomeByDate || []).slice(-10).reverse().map((inc, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <span className="text-sm text-gray-600">{new Date(inc.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-sm font-semibold text-emerald-400">${inc.amount.toLocaleString()}</span>
              </div>
            ))}
            {!data?.incomeByDate?.length && (
              <p className="text-gray-400 text-sm text-center py-8">No income data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
