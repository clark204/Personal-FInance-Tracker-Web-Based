import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

const dataSets = {
  all: [
    { name: "Food & Dining", value: 2400 },
    { name: "Transportation", value: 1200 },
    { name: "Shopping", value: 1800 },
    { name: "Entertainment", value: 800 },
    { name: "Bills & Utilities", value: 1500 },
    { name: "Healthcare", value: 600 },
  ],
  essentials: [
    { name: "Food & Dining", value: 2400 },
    { name: "Bills & Utilities", value: 1500 },
    { name: "Healthcare", value: 600 },
  ],
  "non-essentials": [
    { name: "Transportation", value: 1200 },
    { name: "Shopping", value: 1800 },
    { name: "Entertainment", value: 800 },
  ],
};

const COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f97316", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
  "#eab308", // yellow
];

export default function SpendingCategoryChart() {
  const [filter, setFilter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getData = () => dataSets[filter];
  const total = getData().reduce((sum, d) => sum + d.value, 0);

  const chartData = {
    labels: getData().map((d) => d.name),
    datasets: [
      {
        label: "Spending",
        data: getData().map((d) => d.value),
        backgroundColor: COLORS.slice(0, getData().length),
        borderWidth: 2,
        borderColor: "#fff",
        hoverOffset: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: isMobile ? "bottom" : "right",
        labels: {
          color: "#374151",
          font: { size: isMobile ? 11 : 13, family: "Inter" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const percent = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₱${context.parsed.toLocaleString()} (${percent}%)`;
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold",
          size: isMobile ? 10 : 12,
        },
        formatter: (value) => {
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%`;
        },
      },
    },
  };

  const handleFilterChange = (type) => {
    setFilter(type);
    setMenuOpen(false);
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg text-gray-800">
          Spending by Category
        </h2>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
          >
            {filter === "all"
              ? "All Categories"
              : filter === "essentials"
                ? "Essentials"
                : "Non-Essentials"}
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              {["all", "essentials", "non-essentials"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange(type)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${filter === type
                      ? "text-green-600 font-medium"
                      : "text-gray-700"
                    }`}
                >
                  {filter === type ? "✓ " : ""}
                  {type === "all"
                    ? "All Categories"
                    : type === "essentials"
                      ? "Essentials Only"
                      : "Non-Essentials"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`h-${isMobile ? "64" : "80"}`}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}
