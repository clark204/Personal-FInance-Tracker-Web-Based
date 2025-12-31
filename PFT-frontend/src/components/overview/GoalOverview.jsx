import React, { useState, useEffect, useMemo } from "react";
import { MoreVertical, Target, Calendar, Wallet, CheckCircle, AlertCircle, Clock, Play, Pause } from "lucide-react";
import { useAccount } from "../../hooks/account";

const ITEMS_PER_PAGE = 3;

export default function GoalOverview({ filters }) {
    const { showAccount } = useAccount(filters.account_id);
    
    // Get account data which includes savings/goals
    const accountInfo = showAccount.data?.data;
    const savings = accountInfo?.savings || [];
    
    // Loading and error states
    const isLoading = showAccount.isLoading || (!showAccount.data && !showAccount.error);
    const error = showAccount.error;

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);

    // Get currency from account info
    const accountCurrency = useMemo(() => {
        return accountInfo?.currency?.symbol || 
               accountInfo?.currency?.code || 
               "₱";
    }, [accountInfo]);

    // Process goals to calculate progress and format data
    const processedGoals = useMemo(() => {
        return savings.map(goal => {
            const current = parseFloat(goal.saved_amount || 0);
            const target = parseFloat(goal.target_amount || 0);
            const percentage = target > 0 ? (current / target) * 100 : 0;
            
            // Determine days remaining
            let daysRemaining = null;
            if (goal.deadline) {
                const today = new Date();
                const deadlineDate = new Date(goal.deadline);
                const diffTime = deadlineDate - today;
                daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }

            // Determine if goal is actually reached (based on percentage)
            const isActuallyReached = percentage >= 100;
            
            // Use actual status from API, but also track if it's reached by percentage
            const status = goal.status || "active";
            const isReached = isActuallyReached;

            return {
                id: goal.id,
                name: goal.savings_name || "Unnamed Goal",
                description: goal.description,
                current: current,
                target: target,
                percentage: Math.round(percentage),
                deadline: goal.deadline,
                days_remaining: daysRemaining,
                status: status,
                is_reached: isReached,
                account_name: accountInfo?.account_name || "Unknown Account",
                account_type: accountInfo?.type || "Unknown",
                account_currency: accountCurrency,
                created_at: goal.created_at
            };
        });
    }, [savings, accountInfo, accountCurrency]);

    // Apply status filter
    const filteredGoals = useMemo(() => {
        if (filter === "all") return processedGoals;
        
        if (filter === "reached") {
            // Show goals that are marked as reached OR have percentage >= 100
            return processedGoals.filter(g => g.status === "reached" || g.is_reached);
        }
        
        return processedGoals.filter(g => g.status === filter);
    }, [processedGoals, filter]);

    // Apply date range filter from parent component
    const dateFilteredGoals = useMemo(() => {
        if (!filters.date_from || !filters.date_to) return filteredGoals;
        
        const fromDate = new Date(filters.date_from);
        const toDate = new Date(filters.date_to);
        
        return filteredGoals.filter(goal => {
            if (!goal.deadline) return false;
            const deadlineDate = new Date(goal.deadline);
            
            // Check if goal deadline is within filter date range
            return deadlineDate >= fromDate && deadlineDate <= toDate;
        });
    }, [filteredGoals, filters.date_from, filters.date_to]);

    // Sort goals: reached first, then active, then paused
    const sortedGoals = useMemo(() => {
        return [...dateFilteredGoals].sort((a, b) => {
            // Reached goals first
            if (a.is_reached !== b.is_reached) {
                return a.is_reached ? -1 : 1;
            }
            
            // Then by status: active, then paused
            const statusOrder = { "active": 1, "paused": 2, "reached": 0 };
            if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
            }
            
            // Then by deadline approaching
            if (a.days_remaining !== null && b.days_remaining !== null) {
                if (a.days_remaining < b.days_remaining) return -1;
                if (a.days_remaining > b.days_remaining) return 1;
            } else if (a.days_remaining !== null) {
                return -1;
            } else if (b.days_remaining !== null) {
                return 1;
            }
            
            // Then by percentage (highest first)
            return b.percentage - a.percentage;
        });
    }, [dateFilteredGoals]);

    // Pagination
    const totalPages = Math.ceil(sortedGoals.length / ITEMS_PER_PAGE);
    const paginated = sortedGoals.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, filters]);

    const getStatusConfig = (status, isReached) => {
        // If goal is reached by percentage, show as reached regardless of status
        if (isReached) {
            return {
                color: "bg-green-500 text-white",
                label: "Goal Reached",
                icon: CheckCircle,
                iconClass: "text-green-500"
            };
        }
        
        switch (status) {
            case "active":
                return {
                    color: "bg-blue-500 text-white",
                    label: "Active",
                    icon: Play,
                    iconClass: "text-blue-500"
                };
            case "paused":
                return {
                    color: "bg-gray-500 text-white",
                    label: "Paused",
                    icon: Pause,
                    iconClass: "text-gray-500"
                };
            case "reached":
                return {
                    color: "bg-green-500 text-white",
                    label: "Goal Reached",
                    icon: CheckCircle,
                    iconClass: "text-green-500"
                };
            default:
                return {
                    color: "bg-gray-400 text-white",
                    label: "Unknown",
                    icon: AlertCircle,
                    iconClass: "text-gray-500"
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No deadline";
        try {
            return new Date(dateString).toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric", 
                year: "numeric" 
            });
        } catch (e) {
            return "Invalid date";
        }
    };

    const getDaysRemainingText = (days) => {
        if (days === null || days === undefined) return null;
        if (days < 0) return { text: `Overdue by ${Math.abs(days)} days`, color: "text-red-600" };
        if (days === 0) return { text: "Due today", color: "text-amber-600" };
        if (days === 1) return { text: "Due tomorrow", color: "text-amber-600" };
        if (days <= 7) return { text: `${days} days left`, color: "text-amber-600" };
        return { text: `${days} days left`, color: "text-gray-600" };
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-lg text-gray-800">Goal Overview</h2>
                        <p className="text-sm text-gray-500 mt-1">Loading goals...</p>
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
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg text-gray-800">Goal Overview</h2>
                </div>
                <div className="text-center py-8">
                    <div className="text-red-500 mb-2">
                        Error loading goals
                    </div>
                    <p className="text-sm text-gray-500">
                        {error.message || "Please try again later"}
                    </p>
                </div>
            </div>
        );
    }

    // Empty state
    if (sortedGoals.length === 0) {
        return (
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-lg text-gray-800">Goal Overview</h2>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                        <Target className="h-12 w-12 mx-auto opacity-50" />
                    </div>
                    <p className="text-gray-500 mb-2">No goals found</p>
                    <p className="text-sm text-gray-400">
                        Create your first savings goal to start tracking progress
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 h-fit flex flex-col hover:shadow-lg transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
                <div>
                    <h2 className="font-semibold text-lg text-text">Goal Overview</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {sortedGoals.length === 0 ? "No goals match your filters" : 
                         `Showing ${sortedGoals.length} goal${sortedGoals.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        aria-label="Filter goals"
                        type="button"
                    >
                        <MoreVertical size={18} className="text-gray-600" />
                    </button>
                    {menuOpen && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setMenuOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                {["all", "active", "paused", "reached"].map(t => {
                                    const config = t === "reached" ? getStatusConfig("reached", true) : 
                                                  t === "active" ? getStatusConfig("active", false) : 
                                                  t === "paused" ? getStatusConfig("paused", false) : 
                                                  { icon: MoreVertical, iconClass: "text-gray-500" };
                                    const Icon = config.icon;
                                    
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setFilter(t);
                                                setMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${
                                                filter === t ? "font-semibold text-blue-600 bg-blue-50" : "text-gray-700"
                                            }`}
                                            type="button"
                                        >
                                            <Icon size={16} className={config.iconClass} />
                                            {t === "all" ? "All Goals" :
                                             t === "active" ? "Active" :
                                             t === "paused" ? "Paused" : "Goal Reached"}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Goal list */}
            <div className="space-y-4 flex-1 overflow-y-auto">
                {paginated.map(g => {
                    const daysRemaining = getDaysRemainingText(g.days_remaining);
                    const statusConfig = getStatusConfig(g.status, g.is_reached);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                        <div key={g.id} className="space-y-3 p-3 rounded-lg transition-all duration-300 border border-gray-200 hover:border-gray-400">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Target className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span className="font-medium text-gray-900 truncate">
                                            {g.name}
                                        </span>
                                        {g.description && (
                                            <span className="hidden sm:inline text-xs text-gray-500 truncate">
                                                • {g.description}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Account Info */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                        <Wallet className="h-3 w-3 shrink-0" />
                                        <span className="truncate text-text">{g.account_name}</span>
                                        <span className="shrink-0 px-2 py-0.5 bg-gray-100 rounded text-xs">
                                            {g.account_type}
                                        </span>
                                        <span className="shrink-0 text-xs px-2 py-0.5 bg-gray-200 rounded">
                                            {g.account_currency}
                                        </span>
                                    </div>
                                    
                                    {/* Deadline Info */}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        {g.deadline && (
                                            <>
                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded shrink-0 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(g.deadline)}
                                                </span>
                                                {daysRemaining && (
                                                    <span className={`${daysRemaining.color} bg-red-100 text-red-600 px-2 py-0.5 rounded shrink-0 text-xs`}>
                                                        {daysRemaining.text}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Status Badge */}
                                <span className={`text-xs px-3 py-1 rounded-full shrink-0 ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </div>
                            
                            {/* Goal Amounts and Progress */}
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span className="font-medium">
                                        {g.current.toLocaleString()} / {g.target.toLocaleString()}
                                    </span>
                                    <span className="font-medium">{g.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 border border-gray-400 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 bg-linear-to-r from-main-light to-income`}
                                        style={{ width: `${Math.min(g.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                            
                            {/* Progress Text */}
                            <div className="text-xs text-gray-500 text-center">
                                {g.is_reached ? (
                                    <span className="text-green-600 font-medium flex items-center justify-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Goal reached! ({g.percentage}%)
                                    </span>
                                ) : daysRemaining?.text?.includes("Overdue") ? (
                                    <span className="text-red-600 font-medium flex items-center justify-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {daysRemaining.text}
                                    </span>
                                ) : (
                                    <span className="text-gray-600">
                                        {100 - g.percentage}% to go • {g.account_currency}{(g.target - g.current).toLocaleString()} needed
                                        {g.status === "paused" && (
                                            <span className="ml-2 text-amber-600 font-medium">(Paused)</span>
                                        )}
                                    </span>
                                )}
                            </div>
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
                        className={`px-3 py-1.5 rounded border border-gray-300 transition-colors duration-200 ${
                            currentPage === 1 
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
                        className={`px-3 py-1.5 rounded border border-gray-300 transition-colors duration-200 ${
                            currentPage === totalPages 
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
            {sortedGoals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <span>
                            Showing {paginated.length} of {sortedGoals.length} goals
                            {filters.date_from && filters.date_to && (
                                <span className="ml-2">
                                    • Filtered by date range
                                </span>
                            )}
                        </span>
                        <span className="text-gray-400">
                            Filter: <span className="font-medium">
                                {filter === "all" ? "All" : 
                                 filter === "active" ? "Active" :
                                 filter === "paused" ? "Paused" : "Goal Reached"}
                            </span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}