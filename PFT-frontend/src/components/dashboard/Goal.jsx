import React, { useState } from "react";
import { Plus, Filter, ChevronDown, Target, Trash2 } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import GoalModal from "../modal/GoalModal";

export default function Goal() {
    const [goalModal, setGoalModal] = useState(false);
    const [filter, setFilter] = useState("All");

    const [goals, setGoals] = useState([
        { id: 1, title: "Emergency Fund", target: 10000, saved: 6500, status: "Active", month: "October 2025", category: "Savings" },
        { id: 2, title: "Vacation Fund", target: 5000, saved: 3200, status: "Active", month: "October 2025", category: "Travel" },
        { id: 3, title: "New Laptop", target: 4000, saved: 1800, status: "Paused", month: "October 2025", category: "Gadgets" },
        { id: 4, title: "Wedding Fund", target: 15000, saved: 10000, status: "Active", month: "October 2025", category: "Personal" },
        { id: 5, title: "Car Upgrade", target: 25000, saved: 25000, status: "Completed", month: "August 2025", category: "Vehicle" },
    ]);

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const statusColor = (status) => {
        switch (status) {
            case "Active":
                return "text-income bg-green-100";
            case "Paused":
                return "text-yellow-700 bg-yellow-100";
            case "Completed":
                return "text-balance bg-indigo-100";
            default:
                return "text-slate-600 bg-slate-200";
        }
    };

    const filteredGoals = filter === "All" ? goals : goals.filter((goal) => goal.status === filter);

    return (
        <div className="h-screen p-6 md:p-8 bg-gradient-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-main">Savings Goals</h1>
                    <p className="text-text-secondary text-sm md:text-base">Track your progress towards your financial goals</p>
                </div>
                <button
                    onClick={() => setGoalModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-button text-white rounded-md hover:bg-hover-button transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Goal
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-5 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-icon" />
                    <h2 className="font-semibold text-lg text-main">Filters</h2>
                </div>

                <div className={`grid ${mobileVP ? "grid-cols-1 gap-3" : "grid-cols-3 gap-4"}`}>
                    {/* Status */}
                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Status</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none"
                        >
                            <option value="All">All</option>
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {/* Month Picker */}
                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Month</label>
                        <button className="w-full text-left px-3 py-2 border border-border rounded-md text-sm hover:bg-gray-50">
                            Pick a Month
                        </button>
                    </div>

                    {/* Date Range Picker */}
                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Date Range</label>
                        <button className="w-full text-left px-3 py-2 border border-border rounded-md text-sm hover:bg-gray-50">
                            Pick a Date Range
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-border pt-3">
                    <button className="flex items-center text-sm text-text-secondary hover:text-main">
                        Advanced Filters
                        <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    <button className="text-sm text-text-secondary hover:text-expense">Clear Filters</button>
                </div>
            </div>

            {/* Savings Goal Cards */}
            <div className={`grid ${mobileVP ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"} gap-6`}>
                {filteredGoals.map((goal) => {
                    const progress = Math.min((goal.saved / goal.target) * 100, 100);
                    const remaining = goal.target - goal.saved;
                    const isComplete = remaining <= 0;

                    return (
                        <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition relative">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-main">{goal.title}</h3>
                                    <span className="inline-block text-xs text-text-secondary mt-1">{goal.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-emerald-50 p-2 rounded-full">
                                        <Target className="w-5 h-5 text-icon" />
                                    </div>
                                    <button className="text-expense hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mb-3">
                                <p className="text-sm text-text-secondary mb-1">Progress</p>
                                <div className="w-full bg-border rounded-full h-2">
                                    <div
                                        className="bg-main h-2 rounded-full transition-all"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-text-secondary mt-1">
                                    <span>{progress.toFixed(1)}% complete</span>
                                    <span className="font-medium text-main">
                                        ${goal.saved.toLocaleString()} / ${goal.target.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="border-t border-border pt-3 mt-3 text-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <p className="text-text-secondary text-xs">Remaining</p>
                                        <p className="font-medium text-main">
                                            {isComplete ? "Goal Reached!" : `$${remaining.toLocaleString()}`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-text-secondary text-xs">Deadline</p>
                                        <p className="font-medium text-main">218 days</p>
                                    </div>
                                </div>

                                <div className="bg-[#FAF3E0] rounded-lg p-3 mt-2 text-center">
                                    <p className="text-xs text-text-secondary">Recommended Monthly Saving</p>
                                    <p className="text-lg font-semibold text-main">$225.00/month</p>
                                    <p className="text-xs text-text-secondary">To reach your goal on time</p>
                                </div>

                                <button className="mt-4 w-full flex items-center justify-center gap-2 border border-border py-2 rounded-md hover:bg-gray-50 transition">
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm font-medium text-main">Add Funds</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-8 text-sm text-text-secondary">
                <button className="px-2 py-1 border border-border rounded hover:bg-gray-100">Previous</button>
                <span className="px-3 py-1 bg-main text-white rounded">1</span>
                <span>2</span>
                <span>3</span>
                <button className="px-2 py-1 border border-border rounded hover:bg-gray-100">Next</button>
            </div>

            <GoalModal isOpen={goalModal} onClose={() => setGoalModal(false)} />
        </div>
    );
}
