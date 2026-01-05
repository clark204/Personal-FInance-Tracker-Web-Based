import React, { useState, useEffect, useMemo } from "react";
import { MoreVertical, Wallet, TrendingUp, AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";
import { useAccount } from "../../hooks/account";

const ITEMS_PER_PAGE = 3;

export default function BudgetOverview({ filters }) {
    const { showAccount } = useAccount(filters.account_id);

    // Get account data which includes budgets with categories
    const accountInfo = showAccount.data?.data;
    const budgets = accountInfo?.budgets || [];

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);

    // Loading and error states from account hook
    const isLoading = showAccount.isLoading || (!showAccount.data && !showAccount.error);
    const error = showAccount.error;

    // Process budgets to calculate status and format data
    const processedBudgets = useMemo(() => {
        return budgets.map(budget => {
            const budgetAmount = parseFloat(budget.budget_amount) || 0;
            const budgetSpent = parseFloat(budget.budget_spent) || 0;
            const percentage = budgetAmount > 0 ? (budgetSpent / budgetAmount) * 100 : 0;

            // Get currency symbol from account info
            const accountCurrency = accountInfo?.currency?.symbol ||
                accountInfo?.currency?.code ||
                "$";

            // Check if budget is completed based on date
            const endDate = new Date(budget.end_date);
            const now = new Date();
            const isPastEndDate = now > endDate;

            // Determine UI status based on backend status and calculations
            let displayStatus = budget.status || "pending";

            // For "ontrack" status, check if it's actually over budget
            if (budget.status === "ontrack" && percentage >= 100) {
                displayStatus = "overbudget";
            } else if (budget.status === "ontrack" && percentage >= 80) {
                displayStatus = "warning";
            }

            // If past end date and not already completed, mark as completed
            if (isPastEndDate && !["completed", "overbudget"].includes(budget.status)) {
                displayStatus = "completed";
            }

            return {
                id: budget.id,
                category: budget.category?.category_name || "Uncategorized",
                account: accountInfo?.account_name || "Unknown Account",
                account_type: accountInfo?.type || "Unknown",
                account_currency: accountCurrency,
                spent: budgetSpent,
                budget: budgetAmount,
                percentage: Math.round(percentage),
                // Use backend status for filtering, but displayStatus for UI
                backend_status: budget.status || "pending",
                display_status: displayStatus,
                period_type: budget.period_type,
                start_date: budget.start_date,
                end_date: budget.end_date,
                is_active: !["completed", "overdue"].includes(budget.status),
                is_past_due: isPastEndDate,
                created_at: budget.created_at
            };
        });
    }, [budgets, accountInfo]);

    // Apply status filter
    const filteredBudgets = useMemo(() => {
        if (filter === "all") return processedBudgets;

        // Map filter to backend status values
        const statusMap = {
            "good": ["ontrack"],
            "warning": ["ontrack"], // Will be filtered by percentage later
            "over": ["overbudget"],
            "completed": ["completed"],
            "overdue": ["overdue"],
            "pending": ["pending"]
        };

        let result = processedBudgets;

        if (statusMap[filter]) {
            result = result.filter(b => statusMap[filter].includes(b.backend_status));
        }

        // Additional filtering for warning status (based on percentage)
        if (filter === "warning") {
            result = result.filter(b => b.percentage >= 80 && b.percentage < 100);
        }

        return result;
    }, [processedBudgets, filter]);

    // Apply date range filter from parent component
    const dateFilteredBudgets = useMemo(() => {
        if (!filters.date_from || !filters.date_to) return filteredBudgets;

        const fromDate = new Date(filters.date_from);
        const toDate = new Date(filters.date_to);

        return filteredBudgets.filter(budget => {
            const startDate = new Date(budget.start_date);
            const endDate = new Date(budget.end_date);

            // Check if budget period overlaps with filter date range
            return (
                (startDate <= toDate && endDate >= fromDate) || // Overlapping
                (startDate >= fromDate && startDate <= toDate) || // Starts in range
                (endDate >= fromDate && endDate <= toDate) // Ends in range
            );
        });
    }, [filteredBudgets, filters.date_from, filters.date_to]);

    // Sort budgets: active first, then by percentage (highest to lowest)
    const sortedBudgets = useMemo(() => {
        return [...dateFilteredBudgets].sort((a, b) => {
            // Active budgets first
            if (a.is_active !== b.is_active) {
                return a.is_active ? -1 : 1;
            }
            // Then by creation date (newest first)
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA;
        });
    }, [dateFilteredBudgets]);

    // Pagination
    const totalPages = Math.ceil(sortedBudgets.length / ITEMS_PER_PAGE);
    const paginated = sortedBudgets.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, filters]);

    const getStatusConfig = (status) => {
        switch (status) {
            case "overbudget":
            case "over":
                return {
                    color: "bg-red-500 text-white",
                    label: "Over Budget",
                    icon: AlertCircle,
                    iconClass: "text-red-500"
                };
            case "warning":
                return {
                    color: "bg-yellow-400 text-black",
                    label: "Near Limit",
                    icon: AlertCircle,
                    iconClass: "text-yellow-500"
                };
            case "completed":
                return {
                    color: "bg-blue-500 text-white",
                    label: "Completed",
                    icon: CheckCircle,
                    iconClass: "text-blue-500"
                };
            case "overdue":
                return {
                    color: "bg-orange-500 text-white",
                    label: "Overdue",
                    icon: Clock,
                    iconClass: "text-orange-500"
                };
            case "pending":
                return {
                    color: "bg-gray-400 text-white",
                    label: "Pending",
                    icon: Clock,
                    iconClass: "text-gray-500"
                };
            case "ontrack":
            case "good":
            default:
                return {
                    color: "bg-green-500 text-white",
                    label: "On Track",
                    icon: TrendingUp,
                    iconClass: "text-green-500"
                };
        }
    };

    const getPeriodLabel = (periodType) => {
        switch (periodType) {
            case 'week': return 'Weekly';
            case 'month': return 'Monthly';
            case 'year': return 'Yearly';
            default: return periodType?.charAt(0).toUpperCase() + periodType?.slice(1);
        }
    };

    const formatDateRange = (startDate, endDate) => {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // If same year, show month/day for both
            if (start.getFullYear() === end.getFullYear()) {
                return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            }

            // Different years, show full dates
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } catch (error) {
            return "Invalid date";
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-border h-fit">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-lg text-gray-800">Budget Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">Loading budgets...</p>
                    </div>
                    <div className="animate-pulse h-5 w-5 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-3 p-3">
                            <div className="flex justify-between">
                                <div>
                                    <div className="animate-pulse h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="animate-pulse h-3 w-24 bg-gray-200 rounded"></div>
                                </div>
                                <div className="animate-pulse h-6 w-20 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="animate-pulse h-2 w-full bg-gray-200 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-border h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg text-gray-800">Budget Overview</h2>
                </div>
                <div className="text-center py-8">
                    <div className="text-red-500 mb-2">
                        Error loading budgets
                    </div>
                    <p className="text-sm text-gray-500">
                        {error.message || "Please try again later"}
                    </p>
                </div>
            </div>
        );
    }

    // Empty state
    if (processedBudgets.length === 0) {
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-border h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg text-gray-800">Budget Overview</h2>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                        <Wallet className="h-12 w-12 mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-500 mb-2">No budgets found</p>
                    <p className="text-sm text-gray-400">
                        Create your first budget to start tracking expenses
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border border-border transition-all duration-300 hover:shadow-lg h-fit">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
                <div>
                    <h2 className="font-semibold text-lg text-text">Budget Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {sortedBudgets.length === 0 ? "No budgets match your filters" :
                            `Showing ${sortedBudgets.length} budget${sortedBudgets.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors duration-200"
                        aria-label="Filter budgets"
                        type="button"
                    >
                        <MoreVertical size={18} className="text-text" />
                    </button>
                    {menuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {["all", "good", "warning", "over", "completed", "overdue"].map(t => {
                                    const config = getStatusConfig(t);
                                    const Icon = config.icon;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setFilter(t);
                                                setMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${filter === t ? "font-semibold text-blue-600 bg-blue-50" : "text-gray-700"
                                                }`}
                                            type="button"
                                        >
                                            <Icon size={16} className={config.iconClass} />
                                            {t === "all" ? "All Budgets" :
                                                t === "good" ? "On Track" :
                                                    t === "warning" ? "Near Limit" :
                                                        t === "over" ? "Over Budget" :
                                                            t === "completed" ? "Completed" :
                                                                t === "overdue" ? "Overdue" : "Pending"}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Budget list */}
            <div className="space-y-4 flex-1 overflow-y-auto">
                {paginated.map(b => {
                    const statusConfig = getStatusConfig(b.display_status);
                    const StatusIcon = statusConfig.icon;

                    return (
                        <div key={b.id} className="space-y-3 p-3 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-400 transition-all duration-300 h-fit">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <StatusIcon size={16} className={statusConfig.iconClass} />
                                        <span className="font-medium text-gray-900 truncate">
                                            {b.category}
                                        </span>
                                        {!b.is_active && b.backend_status !== "pending" && (
                                            <span className="shrink-0 text-xs px-2 py-0.5 bg-expense/80 text-white rounded">
                                                Inactive
                                            </span>
                                        )}
                                    </div>

                                    {/* Account Info */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Wallet className="h-3 w-3 shrink-0" />
                                        <span className="truncate text-text">{b.account}</span>
                                        <span className="shrink-0 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                            {b.account_type}
                                        </span>
                                        <span className="shrink-0 text-xs px-2 py-0.5 bg-gray-200 rounded">
                                            {b.account_currency}
                                        </span>
                                    </div>

                                    {/* Period and Date Info */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded shrink-0">
                                            {getPeriodLabel(b.period_type)}
                                        </span>
                                        <span className="truncate px-2 py-0.5 bg-purple-50 text-purple-600 rounded shrink-0 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDateRange(b.start_date, b.end_date)}
                                        </span>
                                        {b.is_past_due && (
                                            <span className="shrink-0 text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded">
                                                Past Due
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <span className={`text-xs px-3 py-1 rounded-full shrink-0 ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>

                            {/* Budget Amounts and Progress */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span className="font-medium">
                                        {b.spent.toLocaleString()} / {b.budget.toLocaleString()}
                                    </span>
                                    <span className="font-medium">{b.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 border border-gray-400 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 bg-linear-to-r from-main-light to-income`}
                                        style={{ width: `${Math.min(b.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Backend Status Info - removed for cleaner UI */}
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6 text-sm">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={`px-3 py-1.5 rounded border border-gray-300 transition-colors duration-200 ${currentPage === 1
                                ? "opacity-50 cursor-not-allowed text-gray-400 bg-gray-100"
                                : "hover:bg-gray-100 text-gray-700 hover:border-gray-400"
                            }`}
                        type="button"
                    >
                        Prev
                    </button>
                    <span className="text-gray-700 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={`px-3 py-1.5 rounded border border-gray-300 transition-colors duration-200 ${currentPage === totalPages
                                ? "opacity-50 cursor-not-allowed text-gray-400 bg-gray-100"
                                : "hover:bg-gray-100 text-gray-700 hover:border-gray-400"
                            }`}
                        type="button"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Results info */}
            {sortedBudgets.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <span>
                            Showing {paginated.length} of {sortedBudgets.length} budgets
                            {filters.date_from && filters.date_to && (
                                <span className="ml-2">
                                    • Filtered by date range
                                </span>
                            )}
                        </span>
                        <span className="text-gray-400">
                            Filter: <span className="font-medium">
                                {filter === "all" ? "All" :
                                    filter === "good" ? "On Track" :
                                        filter === "warning" ? "Near Limit" :
                                            filter === "over" ? "Over Budget" :
                                                filter === "completed" ? "Completed" :
                                                    filter === "overdue" ? "Overdue" : "Pending"}
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}