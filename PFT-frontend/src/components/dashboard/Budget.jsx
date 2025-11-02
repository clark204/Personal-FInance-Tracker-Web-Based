import React, { useState } from "react";
import { Plus, Filter, ChevronDown, Trash2, CheckCircle } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import BudgetModal from "../modal/BudgetModal";

export default function Budget() {
    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const [budgetModal, setBudgetModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [budgets, setBudgets] = useState([
        { id: 1, category: "Food & Dining", month: "Monthly", spent: 199, total: 500, status: "On Track", transactions: 3 },
        { id: 2, category: "Entertainment", month: "Monthly", spent: 200, total: 200, status: "Completed", transactions: 4 },
        { id: 3, category: "Transportation", month: "Monthly", spent: 420, total: 300, status: "Overspend", transactions: 2 },
        { id: 4, category: "Utilities", month: "Monthly", spent: 95, total: 150, status: "On Track", transactions: 1 },
        { id: 5, category: "Shopping", month: "Monthly", spent: 550, total: 400, status: "Overspend", transactions: 5 },
    ]);

    const statusColor = (status) => {
        switch (status) {
            case "On Track":
                return "text-[#109442] bg-[#C9F5D9]";
            case "Completed":
                return "text-[#0B2027] bg-[#FAFDED]";
            case "Overspend":
                return "text-[#F44336] bg-[#FCD6D3]";
            case "Expired":
                return "text-gray-600 bg-gray-200";
            default:
                return "text-slate-600 bg-slate-200";
        }
    };

    const filteredBudgets =
        selectedStatus === "All"
            ? budgets
            : budgets.filter((b) => b.status === selectedStatus);

    return (
        <div className="h-screen p-6 sm:p-8 bg-gradient-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-main">Budgets</h1>
                    <p className="text-text-secondary text-sm">Overview of your current spending</p>
                </div>
                <button
                    onClick={() => setBudgetModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-button text-white rounded-md hover:bg-hover-button transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Budget
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md border border-border p-5 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-main" />
                    <h2 className="font-semibold text-lg text-main">Filters</h2>
                </div>

                <div className={`grid ${mobileVP ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                    {/* Status */}
                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none"
                        >
                            {["All", "On Track", "Expired", "Overspend", "Completed"].map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Picker */}
                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Month</label>
                        <button className="w-full text-left px-3 py-2 border border-border rounded-md text-sm hover:bg-primary-gradient/30">
                            Pick a Month
                        </button>
                    </div>

                    {/* Date Range Picker */}
                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Date Range</label>
                        <button className="w-full text-left px-3 py-2 border border-border rounded-md text-sm hover:bg-primary-gradient/30">
                            Pick a Date Range
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-border pt-3">
                    <button className="flex items-center text-sm text-main hover:text-main-light">
                        Advanced Filters
                        <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    <button
                        onClick={() => setSelectedStatus("All")}
                        className="text-sm text-text-secondary hover:text-expense"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Budget Cards */}
            <div className={`grid ${mobileVP ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"} gap-5`}>
                {filteredBudgets.map((budget) => {
                    const progress = Math.min((budget.spent / budget.total) * 100, 100);
                    const remaining = budget.total - budget.spent;
                    const isOver = remaining < 0;

                    return (
                        <div
                            key={budget.id}
                            className="bg-white border border-border rounded-xl shadow-sm hover:shadow-lg transition p-5 flex flex-col"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-text">{budget.category}</h3>
                                    <p className="text-sm text-text-secondary">{budget.month}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(
                                            budget.status
                                        )}`}
                                    >
                                        {budget.status}
                                    </span>
                                    <Trash2 className="w-4 h-4 text-expense cursor-pointer hover:text-red-700 transition" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm text-text-secondary mb-1">Spent</p>
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-text font-semibold">
                                        ${budget.spent.toFixed(2)} of ${budget.total}
                                    </span>
                                </div>
                                <div className="w-full bg-border rounded-full h-2 mt-1 mb-2">
                                    <div
                                        className="bg-main h-2 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    {isOver
                                        ? `$${Math.abs(remaining).toFixed(2)} over`
                                        : `$${remaining.toFixed(2)} remaining`}
                                </p>
                            </div>

                            <hr className="my-3 border-border" />

                            <div className="flex justify-between text-sm text-text-secondary">
                                <div>
                                    <p className="text-text font-medium">{progress.toFixed(1)}%</p>
                                    <span>Progress</span>
                                </div>
                                <div>
                                    <p className="text-text font-medium">
                                        ${(budget.spent / 20).toFixed(2)}
                                    </p>
                                    <span>Daily Avg</span>
                                </div>
                                <div>
                                    <p className="text-text font-medium">{budget.transactions}</p>
                                    <span>Transactions</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-10 text-sm text-text-secondary">
                <button className="px-2 py-1 border border-border rounded hover:bg-primary-gradient/40 transition">
                    Previous
                </button>
                <span className="px-3 py-1 bg-main text-white rounded">1</span>
                <span>2</span>
                <span>3</span>
                <button className="px-2 py-1 border border-border rounded hover:bg-primary-gradient/40 transition">
                    Next
                </button>
            </div>

            <BudgetModal isOpen={budgetModal} onClose={() => setBudgetModal(false)} />
        </div>
    );
}
