import React, { useState, useEffect } from "react";
import { Plus, Filter, ChevronDown, Trash2, SquarePen, Minus, Search, Wallet, Calendar, Loader, PieChart } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import GoalModal from "../modal/savings/GoalModal";
import { useSavings } from "../../hooks/savings";
import AddFundModal from "../modal/savings/AddFundModal";
import EditGoalModal from "../modal/savings/EditGoalModal";
import AccountFilter from "../common/AccountFilter";
import PeriodSelect from "../common/PeriodSelect";
import SavingsSummary from "../modal/savings/SavingsSummary";
import ConfirmModal from "../common/confirmModal";

export default function Goal() {
    const mobileVP = useMediaQuery({ maxWidth: 768 });
    const [showFilters, setShowFilters] = useState(true);
    const [goalModal, setGoalModal] = useState(false);
    const [addFundsModal, setAddFundsModal] = useState(false);
    const [editGoalModal, setEditGoalModal] = useState(false);
    const [savingsSummaryModal, setSavingsSummaryModal] = useState(false);
    const [fundsType, setFundsType] = useState(null);
    const [savingsID, setSavingsID] = useState(null);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        savings_id: null,
        savings_name: "",
        savings_account: "",
    })

    const [filters, setFilters] = useState({
        search: "",
        account_id: "",
        status: "",
        datePreset: "all",
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
        // Reset loading state when filters change
        setIsLoadingState(true);
    };

    const { getSavings, deleteSaving } = useSavings(null, filters);
    const goals = getSavings.data?.data || [];
    const accounts = getSavings.data?.account || [];

    // Handle loading state
    useEffect(() => {
        if (getSavings.data || getSavings.error) {
            setIsLoadingState(false);
        }
    }, [getSavings.data, getSavings.error]);

    // Determine if we should show loading
    const showLoading = isLoadingState && goals.length === 0;

    // Check if an account is selected
    const isAccountSelected = () => {
        return filters.account_id !== "" && filters.account_id !== null;
    };

    // Get filtered goals for the selected account only
    const getFilteredGoalsForSummary = () => {
        if (!isAccountSelected()) {
            return [];
        }
        return goals.filter(goal => goal.account_id === parseInt(filters.account_id));
    };

    const statusColor = (status) => {
        switch (status) {
            case "active":
                return "text-white bg-income";
            case "paused":
                return "text-white bg-accounts";
            case "reached":
                return "text-white bg-main";
            default:
                return "text-white bg-main-light";
        }
    };

    function getDaysNumber(dateString) {
        if (!dateString) {
            return null;
        }

        const today = new Date();
        const target = new Date(dateString);

        today.setHours(0, 0, 0, 0);
        target.setHours(0, 0, 0, 0);

        const diffMs = target - today;
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    function daysUntil(dateString) {
        if (!dateString) {
            return "No deadline set";
        }

        const diffDays = getDaysNumber(dateString);

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

    function formatDate(dateString) {
        if (!dateString) return "No deadline";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function recommendedSaving(goal) {
        const remaining = parseFloat(goal.target_amount) - parseFloat(goal.saved_amount);
        const daysNum = getDaysNumber(goal.deadline);
        const daysDisplay = daysUntil(goal.deadline);

        if (remaining <= 0) {
            return { amount: 0, unit: "complete", status: "reached", days: daysNum, daysDisplay };
        }

        if (goal.status === "paused") {
            return {
                amount: remaining.toFixed(2),
                unit: "when resumed",
                status: "paused",
                days: daysNum,
                daysDisplay
            };
        }

        if (goal.status === "reached") {
            return {
                amount: 0,
                unit: "goal completed",
                status: "completed",
                days: daysNum,
                daysDisplay
            };
        }

        if (goal.deadline === null || goal.deadline === undefined || goal.deadline === "") {
            return {
                amount: remaining.toFixed(2),
                unit: "total needed",
                status: "no-deadline",
                days: null,
                daysDisplay: "No deadline"
            };
        }

        if (isNaN(daysNum)) {
            return {
                amount: remaining.toFixed(2),
                unit: "fix deadline",
                status: "invalid-date",
                days: null,
                daysDisplay: "Invalid date"
            };
        }

        if (daysNum < 0) {
            return {
                amount: remaining.toFixed(2),
                unit: "immediately",
                status: "overdue",
                days: daysNum,
                daysDisplay
            };
        }

        if (daysNum === 0) {
            return {
                amount: remaining.toFixed(2),
                unit: "today",
                status: "urgent",
                days: daysNum,
                daysDisplay
            };
        }

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

    const handleDeleteSaving = async () => {
        deleteSaving.mutateAsync(confirmDelete.savings_id);
        setConfirmDelete({
            isOpen: false,
            savings_id: null,
            savings_name: ""
        })
    }

    // Loading component for cards
    const LoadingCard = () => (
        <div className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-40 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-2"></div>
                <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="rounded-lg p-3 mb-3 bg-gray-100">
                    <div className="h-3 w-24 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-5 w-32 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="h-3 w-40 bg-gray-200 rounded mx-auto"></div>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen p-4 md:p-6 bg-gradient-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* HEADER SECTION */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">Savings Goals</h1>
                        <p className="text-text-secondary">Track your progress towards your financial goals</p>
                    </div>
                    <button
                        onClick={() => setGoalModal(true)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-button text-white rounded-lg hover:bg-hover-button transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Goal
                    </button>
                </div>
            </div>

            {/* FILTERS CARD */}
            <div className="bg-white rounded-xl shadow-lg border border-border mb-6 overflow-hidden">
                <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary-gradient rounded-lg">
                                <Filter className="w-5 h-5 text-icon" />
                            </div>
                            <h2 className="text-lg font-semibold text-main">Filters</h2>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary hover:text-main transition-colors"
                        >
                            {showFilters ? "Hide Filters" : "Show Filters"}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* FILTERS CONTENT */}
                    {showFilters && (
                        <div className="animate-fadeIn">
                            {/* First Row: Search */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-main mb-2 block">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search goals..."
                                        value={filters.search}
                                        onChange={(e) => updateFilter("search", e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* Second Row: Status Filters */}
                            <div className="mb-6">
                                <label className="text-sm font-medium text-main mb-3 block">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => updateFilter("status", "")}
                                        className={`cursor-pointer px-4 py-2.5 rounded-lg border transition text-sm font-medium ${!filters.status ? 'bg-button text-white border-button' : 'bg-white border-border text-text-secondary hover:border-button hover:text-main'}`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => updateFilter("status", "active")}
                                        className={`cursor-pointer px-4 py-2.5 rounded-lg border transition text-sm font-medium ${filters.status === "active" ? 'bg-income text-white border-income' : 'bg-white border-border text-text-secondary hover:border-income hover:text-main'}`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => updateFilter("status", "paused")}
                                        className={`cursor-pointer px-4 py-2.5 rounded-lg border transition text-sm font-medium ${filters.status === "paused" ? 'bg-accounts text-white border-accounts' : 'bg-white border-border text-text-secondary hover:border-accounts hover:text-main'}`}
                                    >
                                        Paused
                                    </button>
                                    <button
                                        onClick={() => updateFilter("status", "reached")}
                                        className={`cursor-pointer px-4 py-2.5 rounded-lg border transition text-sm font-medium ${filters.status === "reached" ? 'bg-main text-white border-main' : 'bg-white border-border text-text-secondary hover:border-main hover:text-main'}`}
                                    >
                                        Reached
                                    </button>
                                </div>
                            </div>

                            {/* Third Row: Account and Period */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Account Filter */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2 flex items-center gap-2">
                                        <Wallet className="w-4 h-4" />
                                        Account
                                    </label>
                                    <AccountFilter
                                        selectedAccount={filters.account_id}
                                        onSelect={(value) => updateFilter("account_id", value)}
                                    />
                                </div>

                                {/* Period Filter */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Period
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <PeriodSelect
                                                datePreset={filters.datePreset}
                                                dateFrom={filters.date_from}
                                                dateTo={filters.date_to}
                                                onPresetChange={applyPreset}
                                                onDateFromChange={(value) => updateFilter("date_from", value)}
                                                onDateToChange={(value) => updateFilter("date_to", value)}
                                            />
                                        </div>
                                        {filters.datePreset === "custom" && (
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <span>{filters.date_from || "Start"}</span>
                                                <span>to</span>
                                                <span>{filters.date_to || "End"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-4 border-t border-border">
                                <span className="text-sm text-text-secondary">
                                    {showLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </div>
                                    ) : (
                                        `${goals.length} goals found`
                                    )}
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setFilters({
                                                search: '',
                                                account_id: '',
                                                status: '',
                                                datePreset: 'all',
                                                date_from: '',
                                                date_to: '',
                                                page: 1
                                            });
                                        }}
                                        className="cursor-pointer px-5 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:border-expense hover:text-expense transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* GOAL CARDS CONTAINER */}
            <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-main">
                            Your Goals ({showLoading ? "..." : goals.length})
                        </h2>
                        <div className="flex items-center gap-4">
                            {/* Show Savings Summary button only when an account is selected */}
                            {isAccountSelected() && (
                                <button
                                    onClick={() => setSavingsSummaryModal(true)}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-main hover:border-button hover:bg-button hover:text-white transition-colors"
                                >
                                    <PieChart className="w-4 h-4" />
                                    Savings Summary
                                </button>
                            )}
                            <span className="text-sm text-text-secondary">
                                {showLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Loading goals...
                                    </div>
                                ) : (
                                    `Showing ${goals.length} goals`
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Goal Cards Grid */}
                <div className={`grid ${mobileVP ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"} gap-5 p-5`}>
                    {showLoading ? (
                        // Loading state - show 6 skeleton cards
                        Array.from({ length: 6 }).map((_, index) => (
                            <LoadingCard key={index} />
                        ))
                    ) : goals.length > 0 ? (
                        goals.map((goal) => {
                            const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                            const remaining = goal.target_amount - goal.saved_amount;
                            const isComplete = remaining <= 0;
                            const rec = recommendedSaving(goal);
                            const account = accounts.find(acc => acc.id === goal.account_id);
                            const status = goal.status.charAt(0).toUpperCase() + goal.status.slice(1);
                            const startDate = goal.created_at;
                            const endDate = goal.deadline;

                            return (
                                <div key={goal.id} className="bg-white border border-border rounded-xl shadow-sm hover:shadow-lg transition-all p-5 flex flex-col hover:scale-102">
                                    {/* Header */}
                                    <div className="flex justify-between items-start ">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-main">{goal.savings_name}</h3>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(goal.status)}`}
                                                >
                                                    {status}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditGoalModal(true);
                                                    setSavingsID(goal.id);
                                                }}
                                                className="cursor-pointer p-2 text-edit hover:bg-edit/10 rounded-lg transition-colors"
                                                title="Edit Goal"
                                            >
                                                <SquarePen className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="cursor-pointer p-2 text-expense hover:bg-expense/10 rounded-lg transition-colors"
                                                title="Delete Goal"
                                                onClick={() => {
                                                    setConfirmDelete({
                                                        isOpen: true,
                                                        savings_id: goal.id,
                                                        savings_name: goal.savings_name,
                                                        savings_account: account?.account_name
                                                    })
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-text-secondary w-full mb-2 mt-2">
                                        <div className="flex items-center gap-1 w-full">
                                            <span className="font-medium text-text bg-blue-300 px-1 py-0.5 rounded-md">{goal.account?.account_name || account?.account_name}</span>
                                            <span>•</span>
                                            <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                                        </div>
                                        <span className="text-text-secondary">
                                            {goal.description || "No description"}
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-text">Progress</span>
                                            <span className="font-semibold text-main">
                                                {account?.currency?.symbol || "$"}{goal.saved_amount.toLocaleString()} / {account?.currency?.symbol || "$"}{goal.target_amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 border border-gray-400 rounded-full h-2 mb-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-main-light to-income"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text">{progress.toFixed(1)}% complete</span>
                                            <span className={`font-medium ${isComplete ? 'text-income' : 'text-main'}`}>
                                                {isComplete ? "Goal Reached!" : `${account?.currency?.symbol || "$"}${remaining.toLocaleString()} remaining`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="mt-auto pt-4 border-t border-border">
                                        {/* Recommended Saving */}
                                        <div className={`rounded-lg p-3 mb-3 text-center ${rec.status === "reached" ? "bg-income/10" :
                                            rec.status === "overdue" ? "bg-expense/10" :
                                                rec.status === "urgent" ? "bg-accounts/10" :
                                                    rec.status === "paused" ? "bg-border/30" :
                                                        "bg-primary-gradient/50"
                                            }`}>
                                            <p className="text-xs text-text-secondary mb-1">Recommended Saving</p>
                                            {rec.status === "reached" ? (
                                                <p className="text-lg font-semibold text-income">Goal Reached! 🎉</p>
                                            ) : rec.status === "overdue" ? (
                                                <>
                                                    <p className="text-lg font-semibold text-expense">{account?.currency?.symbol || "$"}{rec.amount} immediately</p>
                                                    <p className="text-xs text-text-secondary">Deadline passed - save now!</p>
                                                </>
                                            ) : rec.status === "urgent" ? (
                                                <>
                                                    <p className="text-lg font-semibold text-accounts">{account?.currency?.symbol || "$"}{rec.amount} / {rec.unit}</p>
                                                    <p className="text-xs text-text-secondary">Save now to meet deadline!</p>
                                                </>
                                            ) : rec.status === "paused" ? (
                                                <>
                                                    <p className="text-lg font-semibold text-text-secondary">{account?.currency?.symbol || "$"}{rec.amount} when resumed</p>
                                                    <p className="text-xs text-text-secondary">Goal is paused</p>
                                                </>
                                            ) : rec.status === "no-deadline" ? (
                                                <>
                                                    <p className="text-lg font-semibold text-main">{account?.currency?.symbol || "$"}{rec.amount} total</p>
                                                    <p className="text-xs text-text-secondary">Set deadline for better plan</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-lg font-semibold text-main">
                                                        {account?.currency?.symbol || "$"}{rec.amount} / {rec.unit}
                                                    </p>
                                                    <p className="text-xs text-text-secondary">To reach your goal on time</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setAddFundsModal(true);
                                                    setSavingsID(goal.id);
                                                    setFundsType("deposit");
                                                }}
                                                className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg bg-income/70 hover:bg-income transition-all duration-300"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-sm font-medium text-main">Add Funds</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAddFundsModal(true);
                                                    setSavingsID(goal.id);
                                                    setFundsType("withdraw");
                                                }}
                                                className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg bg-expense/70 hover:bg-expense transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                                <span className="text-sm font-medium text-main">Withdraw</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-icon" />
                            </div>
                            <h3 className="text-lg font-semibold text-main mb-2">No Goals Found</h3>
                            <p className="text-text-secondary mb-6 max-w-md">
                                Create your first savings goal to start tracking your progress.
                            </p>
                            <button
                                onClick={() => setGoalModal(true)}
                                className="px-4 py-2 bg-button text-white rounded-lg hover:bg-hover-button transition-colors"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Create Goal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <GoalModal isOpen={goalModal} onClose={() => setGoalModal(false)} />
            <AddFundModal
                isOpen={addFundsModal}
                onClose={() => {
                    setAddFundsModal(false);
                    setSavingsID(null);
                    setFundsType(null);
                }}
                savingsID={savingsID}
                fundsType={fundsType}
            />
            <EditGoalModal
                isOpen={editGoalModal}
                onClose={() => {
                    setSavingsID(null);
                    setEditGoalModal(false);
                }}
                ID={savingsID}
            />
            <SavingsSummary
                isOpen={savingsSummaryModal}
                onClose={() => setSavingsSummaryModal(false)}
                goals={getFilteredGoalsForSummary()}
            />

            <ConfirmModal
                show={confirmDelete.isOpen}
                title="Confirm Action"
                text={`Are you sure you want to delete "${confirmDelete.savings_name}" from account "${confirmDelete.savings_name}"?`}
                type="danger"
                onSubmit={handleDeleteSaving}
                onClose={() => {
                    setConfirmDelete({
                        isOpen: false,
                        savings_id: null
                    })
                }}
            />
        </div>
    );
}