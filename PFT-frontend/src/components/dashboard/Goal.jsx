import React, { useState } from "react";
import { Plus, Filter, ChevronDown, Trash2, SquarePen, Minus } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import GoalModal from "../modal/GoalModal";
import { useSavings } from "../../hooks/savings";
import AddFundModal from "../modal/AddFundModal";
import EditGoalModal from "../modal/EditGoalModal";
import AccountFilter from "../common/AccountFilter";
import PeriodSelect from "../common/PeriodSelect";

export default function Goal() {
    const [filters, setFilters] = useState({
        search: "",
        account_id: "",
        status: "",
        datePreset: "",
        date_from: "",
        page: 1,
        date_to: "",
    });

    const updateFilter = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: field === "page" ? value : 1
        }));
    };

    const { getSavings } = useSavings(null, filters);
    const goals = getSavings.data?.data || [];
    const accounts = getSavings.data?.account || [];

    const [goalModal, setGoalModal] = useState(false);
    const [addFundsModal, setAddFundsModal] = useState(false);
    const [editGoalModal, setEditGoalModal] = useState(false);
    const [fundsType, setFundsType] = useState(null);
    const [savingsID, setSavingsID] = useState(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const statusColor = (status) => {
        switch (status) {
            case "active":
                return "text-income bg-green-100";
            case "paused":
                return "text-yellow-700 bg-yellow-100";
            case "reached":
                return "text-balance bg-indigo-100";
            default:
                return "text-slate-600 bg-slate-200";
        }
    };

    function getDaysNumber(dateString) {
        // Handle null/undefined/empty date string
        if (!dateString) {
            return null; // Or Infinity or a special value
        }

        const today = new Date();
        const target = new Date(dateString);

        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);

        const diffMs = target - today;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    function daysUntil(dateString) {
        // Handle null/undefined deadline
        if (!dateString) {
            return "No deadline set";
        }

        const diffDays = getDaysNumber(dateString);

        // Check if date is invalid
        if (isNaN(diffDays)) {
            return "Invalid date";
        }

        if (diffDays < 0) {
            const daysOverdue = Math.abs(diffDays);
            if (daysOverdue === 1) return "1 day overdue";
            return `${daysOverdue} days overdue`;
        } else if (diffDays === 0) {
            return "Today";
        } else if (diffDays === 1) {
            return "Tomorrow";
        } else {
            return `${diffDays} days`;
        }
    }

    function recommendedSaving(goal) {
        const remaining = parseFloat(goal.target_amount) - parseFloat(goal.saved_amount);
        const daysNum = getDaysNumber(goal.deadline); // This will be null for no deadline
        const daysDisplay = daysUntil(goal.deadline); // For display

        if (remaining <= 0) {
            return { amount: 0, unit: "complete", status: "reached", days: daysNum, daysDisplay };
        }

        // Handle different goal statuses
        if (goal.status === "paused") {
            return {
                amount: remaining.toFixed(2),
                unit: "when resumed",
                status: "paused",
                days: daysNum,
                daysDisplay
            };
        }

        if (goal.status === "completed") {
            return {
                amount: 0,
                unit: "goal completed",
                status: "completed",
                days: daysNum,
                daysDisplay
            };
        }

        // Handle goals with no deadline (null)
        if (goal.deadline === null || goal.deadline === undefined || goal.deadline === "") {
            return {
                amount: remaining.toFixed(2),
                unit: "total needed",
                status: "no-deadline",
                days: null,
                daysDisplay: "No deadline"
            };
        }

        // Check if date is invalid
        if (isNaN(daysNum)) {
            return {
                amount: remaining.toFixed(2),
                unit: "fix deadline",
                status: "invalid-date",
                days: null,
                daysDisplay: "Invalid date"
            };
        }

        // For active goals with passed deadline
        if (daysNum < 0) {
            return {
                amount: remaining.toFixed(2),
                unit: "immediately",
                status: "overdue",
                days: daysNum,
                daysDisplay
            };
        }

        // For active goals with 0 days (due today)
        if (daysNum === 0) {
            return {
                amount: remaining.toFixed(2),
                unit: "today",
                status: "urgent",
                days: daysNum,
                daysDisplay
            };
        }

        // Normal calculation for active goals with valid deadline
        if (daysNum >= 30) {
            const months = daysNum / 30;
            return {
                amount: (remaining / months).toFixed(2),
                unit: "month",
                status: daysNum <= 60 ? "soon" : "on-track",
                days: daysNum,
                daysDisplay
            };
        }

        if (daysNum >= 7) {
            const weeks = daysNum / 7;
            return {
                amount: (remaining / weeks).toFixed(2),
                unit: "week",
                status: daysNum <= 14 ? "urgent" : "soon",
                days: daysNum,
                daysDisplay
            };
        }

        return {
            amount: (remaining / daysNum).toFixed(2),
            unit: "day",
            status: "urgent",
            days: daysNum,
            daysDisplay
        };
    }

    function applyPreset(preset) {
        const now = new Date();
        const start = new Date();

        if (preset === "all") {
            updateFilter("date_from", "");
            updateFilter("date_to", "");
            updateFilter("datePreset", "all");
            return;
        }

        // if (preset === "today") {
        //     start.setHours(0, 0, 0, 0);
        //     updateFilter("date_from", start.toISOString().slice(0, 10));
        //     updateFilter("date_to", now.toISOString().slice(0, 10));
        // }

        if (preset === "week") {
            start.setDate(now.getDate() - now.getDay());
            updateFilter("date_from", start.toISOString().slice(0, 10));
            updateFilter("date_to", now.toISOString().slice(0, 10));
        }

        if (preset === "month") {
            start.setDate(1);
            updateFilter("date_from", start.toISOString().slice(0, 10));
            updateFilter("date_to", now.toISOString().slice(0, 10));
        }

        if (preset === "year") {
            start.setMonth(0, 1);
            updateFilter("date_from", start.toISOString().slice(0, 10));
            updateFilter("date_to", now.toISOString().slice(0, 10));
        }

        if (preset === "custom") {
            updateFilter("date_from", "");
            updateFilter("date_to", "");
        }

        updateFilter("datePreset", preset);
    }

    return (
        <div className="h-screen p-4 md:p-6 bg-linear-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
                <div>
                    <h1 className="text-2xl font-semibold text-main">Savings Goals</h1>
                    <p className="text-text-secondary text-sm">Track your progress towards your financial goals</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-border p-4 mb-6">
                <div className="w-full flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className={`text-icon ${mobileVP ? "w-4 h-4" : "w-5 h-5"}`} />
                        <h2 className={`font-semibold ${mobileVP ? "text-base" : "text-lg"}`}>Filters</h2>
                    </div>

                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className="flex items-center text-sm text-text hover:font-medium cursor-pointer transition"
                    >
                        {isFiltersOpen ? "Hide" : "Show"}
                        <ChevronDown
                            className={`ml-1 transition-transform  ${isFiltersOpen ? "rotate-180" : ""} 
                                        ${mobileVP ? "w-3 h-3" : "w-4 h-4"}`}
                        />
                    </button>
                </div>

                {isFiltersOpen && (
                    <div className="">
                        <div className={`grid ${mobileVP ? "grid-cols-1 gap-3" : "grid-cols-3 gap-4"}`}>
                            {/* Search */}
                            <div className="c">
                                <label className="text-sm block mb-1 text-text ">Search</label>
                                <input
                                    type="text"
                                    placeholder="Search description..."
                                    value={filters.search}
                                    onChange={(e) => updateFilter("search", e.target.value)}
                                    className="w-full border border-border bg-white rounded-md px-3 py-2 text-sm"
                                />
                            </div>

                            {/* Account */}
                            <AccountFilter
                                selectedAccount={filters.account_id}
                                onSelect={(value) => updateFilter("account_id", value)}
                            />

                            {/* Status */}
                            <div>
                                <label className="text-sm text-text block mb-1">Status</label>
                                <select
                                    className="w-full border border-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none"
                                    value={filters.status}
                                    onChange={(e) => updateFilter("status", e.target.value)}
                                >
                                    <option value="">All status</option>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="reached">Reached</option>
                                </select>
                            </div>

                            {/* Period */}
                            <PeriodSelect
                                datePreset={filters.datePreset}
                                dateFrom={filters.date_from}
                                dateTo={filters.date_to}
                                onPresetChange={applyPreset}
                                onDateFromChange={(value) => updateFilter("date_from", value)}
                                onDateToChange={(value) => updateFilter("date_to", value)}
                            />
                        </div>

                        {/* Clear Filter */}
                        <div className="flex justify-end pt-4 border-t mt-4">
                            <button
                                onClick={() => {
                                    // Reset all filters to default values
                                    setFilters({
                                        search: '',
                                        account_id: '',
                                        status: '',
                                        datePreset: 'all', // or whatever your default preset is
                                        date_from: '',
                                        date_to: ''
                                    });
                                }}
                                className="px-5 text-sm hover:font-medium rounded-lg  text-text/70
                             hover:text-red-500 transition cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Savings Goal Cards */}
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 min-h-[450px] flex flex-col">
                <div className={`grid ${mobileVP ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"} gap-6 `}>
                    {goals.map((goal) => {
                        const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                        const remaining = goal.target_amount - goal.saved_amount;
                        const isComplete = remaining <= 0;

                        const rec = recommendedSaving(goal);

                        const account = accounts.find(acc => acc.id === goal.account_id);

                        const status = goal.status.charAt(0).toUpperCase() + goal.status.slice(1);
                        return (
                            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-border p-5 hover:shadow-md transition relative">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-text">{goal.savings_name}</h3>
                                        <p className="text-md font-semibold text-text-secondary">{goal.account.account_name}</p>
                                        <span className="inline-block text-xs text-text-secondary mt-1">{goal.description || "-"}</span>
                                    </div>
                                    <div className="">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(goal.status)}`}>{status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full cursor-pointer">
                                            <SquarePen
                                                onClick={() => {
                                                    setEditGoalModal(true);
                                                    setSavingsID(goal.id);
                                                }}
                                                className="w-5 h-5 text-edit "
                                            />
                                        </div>
                                        <button className="text-expense hover:text-red-700 cursor-pointer p-2 rounded-full">
                                            <Trash2 className="w-4 h-4 text-lg" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-3">
                                    <p className="text-sm text-text mb-1">Progress</p>
                                    <div className="w-full bg-border rounded-full h-2">
                                        <div
                                            className="bg-linear-to-r from-main-light to-income h-2 rounded-full transition-all"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-text mt-1">
                                        <span>{progress.toFixed(1)}% complete</span>
                                        <span className="font-medium text-main-light">
                                            {account.currency?.symbol}{goal.saved_amount.toLocaleString()} / {account.currency?.symbol}{goal.target_amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="border-t border-border pt-3 mt-3 text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-text/70 text-xs">Remaining</p>
                                            <p className="font-medium text-main">
                                                {isComplete ? "Goal Reached!" : `${account.currency?.symbol}${remaining.toLocaleString()}`}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-text/70 text-xs">Days</p>
                                            <p className={`font-medium ${typeof daysUntil(goal.deadline) === 'string' &&
                                                (daysUntil(goal.deadline).includes('overdue') || daysUntil(goal.deadline) === 'Today')
                                                ? 'text-red-600'
                                                : daysUntil(goal.deadline) === 'No deadline set'
                                                    ? 'text-text-secondary'
                                                    : 'text-main'
                                                }`}>
                                                {daysUntil(goal.deadline)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className={`rounded-lg p-3 mt-2 text-center ${rec.status === "reached" ? "bg-green-100" :
                                        rec.status === "overdue" ? "bg-red-100" :
                                            rec.status === "urgent" ? "bg-yellow-100" :
                                                rec.status === "paused" ? "bg-gray-100" :
                                                    "bg-[#FAF3E0]"
                                        }`}>
                                        <p className="text-xs text-text">Recommended Saving</p>
                                        {rec.status === "reached" ? (
                                            <p className="text-lg font-semibold text-green-600">Goal Reached! 🎉</p>
                                        ) : rec.status === "overdue" ? (
                                            <>
                                                <p className="text-lg font-semibold text-red-600">{account.currency?.symbol}{rec.amount} immediately</p>
                                                <p className="text-xs text-text/70">Deadline passed - save now!</p>
                                            </>
                                        ) : rec.status === "urgent" ? (
                                            <>
                                                <p className="text-lg font-semibold text-yellow-600">{account.currency?.symbol}{rec.amount} / {rec.unit}</p>
                                                <p className="text-xs text-text/70">Save now to meet deadline!</p>
                                            </>
                                        ) : rec.status === "paused" ? (
                                            <>
                                                <p className="text-lg font-semibold text-gray-600">{account.currency?.symbol}{rec.amount} when resumed</p>
                                                <p className="text-xs text-text/70">Goal is paused</p>
                                            </>
                                        ) : rec.status === "no-deadline" ? (
                                            <>
                                                <p className="text-lg font-semibold text-blue-600">{account.currency?.symbol}{rec.amount} total</p>
                                                <p className="text-xs text-text/70">Set deadline for better plan</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-lg font-semibold text-main">
                                                    {account.currency?.symbol}{rec.amount} / {rec.unit}
                                                </p>
                                                <p className="text-xs text-text/70">To reach your goal on time</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setAddFundsModal(true);
                                                setSavingsID(goal.id);
                                                setFundsType("deposit");
                                            }}
                                            className="mt-4 w-full flex items-center justify-center gap-2 border border-border py-2 rounded-md hover:bg-gray-50 transition">
                                            <Plus className="w-4 h-4" />
                                            <span className="text-sm font-medium text-main">Add Funds</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAddFundsModal(true);
                                                setSavingsID(goal.id);
                                                setFundsType("withdraw");
                                            }}
                                            className="mt-4 w-full flex items-center justify-center gap-2 border border-border py-2 rounded-md hover:bg-gray-50 transition">
                                            <Minus className="w-4 h-4" />
                                            <span className="text-sm font-medium text-main">Withdraw</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-auto pt-6 text-sm text-text-secondary">
                    <button className="px-2 py-1 border border-border rounded hover:bg-gray-100">Previous</button>
                    <span className="px-3 py-1 bg-main text-white rounded">1</span>
                    <span>2</span>
                    <span>3</span>
                    <button className="px-2 py-1 border border-border rounded hover:bg-gray-100">Next</button>
                </div>
            </div>

            <GoalModal isOpen={goalModal} onClose={() => setGoalModal(false)} />
            <AddFundModal isOpen={addFundsModal} onClose={() => {
                setAddFundsModal(false);
                setSavingsID(null);
                setFundsType(null);
            }}
                savingsID={savingsID}
                fundsType={fundsType} />
            <EditGoalModal isOpen={editGoalModal} onClose={() => {
                setSavingsID(null);
                setEditGoalModal(false)
            }} ID={savingsID} />
        </div>
    );
}
