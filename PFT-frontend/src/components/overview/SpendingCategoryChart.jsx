import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTransaction } from "../../hooks/transaction";
import { Wallet } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f97316", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
  "#eab308", // yellow
  "#06b6d4", // cyan
  "#f43f5e", // pink
  "#84cc16", // lime
  "#6366f1", // indigo
];

export default function SpendingCategoryChart({ filters }) {
  const { getTransactions } = useTransaction(null, filters);
  const transactions = getTransactions.data?.data || [];

  // Extract date values from filters
  const { date_from: dateFrom, date_to: dateTo } = filters;

  // Filter transactions based on date range (expenses only)
  const filteredTransactions = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;

    return transactions.filter(
      (item) =>
        item.type === "Expense" &&
        (!from || new Date(item.transaction_date || item.date) >= from) &&
        (!to || new Date(item.transaction_date || item.date) <= to)
    );
  }, [transactions, dateFrom, dateTo]);

  // Extract currency symbol and account name from transactions
  const { currencySymbol, accountName } = useMemo(() => {
    // Default values
    let symbol = "$";
    let name = "Unknown Account";

    if (filteredTransactions.length > 0) {
      // Try to get currency and account from the first transaction
      const firstTransaction = filteredTransactions[0];

      if (firstTransaction?.account?.currency?.symbol) {
        symbol = firstTransaction.account.currency.symbol;
      }

      if (firstTransaction?.account?.account_name) {
        name = firstTransaction.account.account_name;
      } else {
        // Fallback: check any transaction for account name
        for (const transaction of filteredTransactions) {
          if (transaction?.account?.account_name) {
            name = transaction.account.account_name;
            break;
          }
        }
      }
    }

    return { currencySymbol: symbol, accountName: name };
  }, [filteredTransactions]);

  // Group expenses by category
  const groupedData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((item) => {
      const categoryName =
        item.category?.category_name || item.description || "Uncategorized";
      if (!map[categoryName]) map[categoryName] = 0;
      map[categoryName] += parseFloat(item.amount);
    });

    // Sort by amount (descending) and take top 8 categories
    const sortedEntries = Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    // If there are more than 8, group the rest as "Others"
    if (Object.entries(map).length > 8) {
      const otherAmount = Object.entries(map)
        .slice(8)
        .reduce((sum, [, amount]) => sum + amount, 0);

      if (otherAmount > 0) {
        sortedEntries.push(["Others", otherAmount]);
      }
    }

    return Object.fromEntries(sortedEntries);
  }, [filteredTransactions]);

  const chartData = {
    labels: Object.keys(groupedData),
    datasets: [
      {
        label: "Spending",
        data: Object.values(groupedData),
        backgroundColor: COLORS.slice(0, Object.keys(groupedData).length),
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const total = Object.values(groupedData).reduce((sum, val) => sum + val, 0);
  const isMobile = window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: "easeOutQuart" },
    plugins: {
      legend: {
        position: isMobile ? "bottom" : "right",
        labels: {
          color: "#374151",
          font: { size: isMobile ? 11 : 12, family: "Inter" },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const percent = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${currencySymbol}${context.parsed.toLocaleString()} (${percent}%)`;
          },
        },
      },
      datalabels: {
        display: (context) => {
          // Only show labels for slices > 5%
          const percentage = (context.dataset.data[context.dataIndex] / total) * 100;
          return percentage > 5 && !isMobile;
        },
        color: "#fff",
        font: { weight: "bold", size: isMobile ? 10 : 12 },
        formatter: (value) => {
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%`;
        },
      },
    },
  };

  // Calculate top 3 categories
  const topCategories = useMemo(() => {
    const entries = Object.entries(groupedData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return entries.map(([name, amount], index) => ({
      name,
      amount,
      percentage: ((amount / total) * 100).toFixed(1),
      color: COLORS[index]
    }));
  }, [groupedData, total]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-300 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-lg text-text">Spending by Category</h2>
          <p className="text-sm text-gray-500">
            {dateFrom && dateTo
              ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
              : 'All time'
            }
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Total Spending Card */}
          <div className="col-span-2 md:col-span-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {currencySymbol}{total.toFixed(2)}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {filteredTransactions.length} transactions
              </div>
            </div>
          </div>

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <div className="col-span-2 md:col-span-4 mt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Top Categories</p>
              <div className="space-y-2">
                {topCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></div>
                      <span className="text-sm text-gray-700 truncate max-w-[120px]">
                        {cat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {currencySymbol}{cat.amount.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {Object.keys(groupedData).length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Wallet className="w-10 h-10 mb-4" />
            <p className="text-lg font-medium">No spending data available</p>
            <p className="text-sm mt-2">No expenses recorded for this period</p>
          </div>
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}