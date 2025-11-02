import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const dataSets = {
    monthly: [
        { name: "Jan", income: 4000, expense: 2400 },
        { name: "Feb", income: 3000, expense: 1398 },
        { name: "Mar", income: 2000, expense: 9800 },
        { name: "Apr", income: 2780, expense: 3908 },
        { name: "May", income: 1890, expense: 4800 },
        { name: "Jun", income: 2390, expense: 3800 },
    ],
    weekly: [
        { name: "Week 1", income: 1200, expense: 800 },
        { name: "Week 2", income: 1500, expense: 950 },
        { name: "Week 3", income: 1100, expense: 1200 },
        { name: "Week 4", income: 1300, expense: 850 },
    ],
    yearly: [
        { name: "2020", income: 48000, expense: 35000 },
        { name: "2021", income: 52000, expense: 38000 },
        { name: "2022", income: 58000, expense: 42000 },
        { name: "2023", income: 62000, expense: 45000 },
        { name: "2024", income: 68000, expense: 48000 },
    ],
};

export default function IncomeExpenseChart() {
    const [filter, setFilter] = useState("monthly");
    const [menuOpen, setMenuOpen] = useState(false);

    const getData = () => dataSets[filter];

    const chartData = {
        labels: getData().map((item) => item.name),
        datasets: [
            {
                label: "Income",
                data: getData().map((item) => item.income),
                backgroundColor: "rgba(16, 185, 129, 0.8)", // emerald green
                borderColor: "rgba(5, 150, 105, 1)",
                borderWidth: 1,
                borderRadius: 6,
            },
            {
                label: "Expense",
                data: getData().map((item) => item.expense),
                backgroundColor: "rgba(239, 68, 68, 0.8)", // bright red
                borderColor: "rgba(220, 38, 38, 1)",
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 900,
            easing: "easeOutQuart",
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#374151",
                    font: { size: 13, family: "Inter" },
                },
            },
        },
        scales: {
            x: {
                ticks: { color: "#6B7280" },
                grid: { display: false },
            },
            y: {
                ticks: { color: "#6B7280" },
                grid: { color: "rgba(229,231,235,0.4)" },
            },
        },
    };

    const toggleFilter = (type) => {
        setFilter(type);
        setMenuOpen(false);
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg text-gray-800">Income vs Expense</h2>
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)} <ChevronDown size={16} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden animate-fadeIn">
                            {["weekly", "monthly", "yearly"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => toggleFilter(type)}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${
                                        filter === type ? "text-green-600 font-medium" : "text-gray-700"
                                    }`}
                                >
                                    {filter === type ? "✓ " : ""}
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-80">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}
