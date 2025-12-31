import React, { useState, useEffect } from "react";
import { Plus, Filter, ChevronDown, Trash2, CheckCircle, SquarePen, Search, Calendar, Wallet, Tag, Loader, PieChart } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import BudgetModal from "../modal/budget/BudgetModal";
import { useBudget } from "../../hooks/budget";
import EditBudgetModal from "../modal/budget/EditBudgetModal";
import BudgetTransactionsModal from "../modal/budget/BudgetTransactionsModal";
import CategoryFilter from "../common/CategoryFilter";
import AccountFilter from "../common/AccountFilter";
import PeriodSelect from "../common/PeriodSelect";
import BudgetSummary from "../modal/budget/BudgetSummary";
import ConfirmModal from "../common/confirmModal"; // Add this import

export default function Budget() {
    const mobileVP = useMediaQuery({ maxWidth: 768 });
    const [showFilters, setShowFilters] = useState(true);
    const [budgetModal, setBudgetModal] = useState(false);
    const [editBudgetModal, setEditBudgetModal] = useState(false);
    const [budgetTransactionsModal, setBudgetTransactionsModal] = useState(false);
    const [budgetID, setBudgetID] = useState(null);
    const [isLoadingState, setIsLoadingState] = useState(true);
    const [budgetSummaryModal, setBudgetSummaryModal] = useState(false);
    
    // Add confirm delete state
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        budgetId: null,
        budgetName: "",
        accountName: ""
    });

    const [filters, setFilters] = useState({
        account_id: "",
        category_id: "",
        status: "",
        datePreset: "",
        date_from: "",
        page: 1,
        date_to: "",
        search: "",
    });

    // Add delete mutation
    const { getBudgets, deleteBudget } = useBudget(null, filters);
    const budgets = getBudgets.data?.data || [];

    const updateFilter = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: field === "page" ? value : 1
        }));
        // Reset loading state when filters change
        setIsLoadingState(true);
    };

    // Handle loading state
    useEffect(() => {
        if (getBudgets.data || getBudgets.error) {
            setIsLoadingState(false);
        }
    }, [getBudgets.data, getBudgets.error]);

    // Handle delete budget
    const handleDeleteBudget = async () => {
        if (confirmDelete.budgetId) {
            await deleteBudget.mutateAsync(confirmDelete.budgetId);
            setConfirmDelete({ 
                isOpen: false, 
                budgetId: null, 
                budgetName: "", 
                accountName: "" 
            });
        }
    };

    // Open delete confirmation
    const openDeleteConfirmation = (budgetId, budgetName, accountName) => {
        setConfirmDelete({
            isOpen: true,
            budgetId,
            budgetName: budgetName || "this budget",
            accountName: accountName || ""
        });
    };

    // Determine if we should show loading
    const showLoading = isLoadingState && budgets.length === 0;

    const statusColor = (status) => {
        switch (status) {
            case "ontrack":
                return "text-white bg-income";
            case "completed":
                return "text-white bg-main";
            case "overbudget":
                return "text-white bg-expense";
            case "overdue":
                return "text-white bg-accounts";
            case "pending":
                return "text-white bg-border";
            default:
                return "text-white bg-main-light";
        }
    };

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

    function formatDate(dateString) {
        if (!dateString) return "No date";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Check if an account is selected
    const isAccountSelected = () => {
        return filters.account_id !== "" && filters.account_id !== null;
    };

    // Get filtered budgets for the selected account only
    const getFilteredBudgetsForSummary = () => {
        if (!isAccountSelected()) {
            return [];
        }
        return budgets.filter(budget => budget.account_id === parseInt(filters.account_id));
    };

    // Loading component for cards
    const LoadingCard = () => (
        <div className="bg-white border border-border rounded-xl shadow-sm p-5 flex flex-col animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex justify-between mb-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mb-2"></div>
                <div className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-10 bg-gray-200 rounded"></div>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                    <div className="text-center">
                        <div className="h-3 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                        <div className="h-5 w-10 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    <div className="text-center">
                        <div className="h-3 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                        <div className="h-5 w-10 bg-gray-200 rounded mx-auto"></div>
                    </div>
                    <div className="text-center">
                        <div className="h-3 w-16 bg-gray-200 rounded mx-auto mb-1"></div>
                        <div className="h-5 w-10 bg-gray-200 rounded mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen p-4 sm:p-6 bg-gradient-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* HEADER SECTION */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">Budgets</h1>
                        <p className="text-text-secondary">
                            Track and manage your spending limits
                        </p>
                    </div>
                    <button
                        onClick={() => setBudgetModal(true)}
                        className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-button text-white rounded-lg hover:bg-hover-button transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Budget
                    </button>
                </div>
            </div>

            {/* FILTERS CARD */}
            <div className="bg-white rounded-xl shadow-lg border border-border mb-6 overflow-hidden">
                <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-main mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search budgets..."
                                            value={filters.search}
                                            onChange={(e) => updateFilter("search", e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

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

                                {/* Category Filter */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" />
                                        Category
                                    </label>
                                    <CategoryFilter
                                        selectedCategory={filters.category_id}
                                        onSelect={(value) => updateFilter("category_id", value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Status Filter */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => updateFilter("status", "")}
                                            className={`cursor-pointer flex-1 min-w-20 px-3 py-2.5 rounded-lg border transition text-sm ${!filters.status ? 'bg-button text-white border-button' : 'bg-white border-border text-main hover:border-button'}`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => updateFilter("status", "ontrack")}
                                            className={`cursor-pointer flex-1 min-w-20 px-3 py-2.5 rounded-lg border transition text-sm ${filters.status === "ontrack" ? 'bg-income text-white border-income' : 'bg-white border-border text-main hover:border-income'}`}
                                        >
                                            On Track
                                        </button>
                                        <button
                                            onClick={() => updateFilter("status", "overbudget")}
                                            className={`cursor-pointer flex-1 min-w-20 px-3 py-2.5 rounded-lg border transition text-sm ${filters.status === "overbudget" ? 'bg-expense text-white border-expense' : 'bg-white border-border text-main hover:border-expense'}`}
                                        >
                                            Over Budget
                                        </button>
                                        <button
                                            onClick={() => updateFilter("status", "overdue")}
                                            className={`cursor-pointer flex-1 min-w-20 px-3 py-2.5 rounded-lg border transition text-sm ${filters.status === "overdue" ? 'bg-accounts text-white border-accounts' : 'bg-white border-border text-main hover:border-accounts'}`}
                                        >
                                            Overdue
                                        </button>
                                        <button
                                            onClick={() => updateFilter("status", "completed")}
                                            className={`cursor-pointer flex-1 min-w-20 px-3 py-2.5 rounded-lg border transition text-sm ${filters.status === "completed" ? 'bg-main text-white border-main' : 'bg-white border-border text-main hover:border-main'}`}
                                        >
                                            Completed
                                        </button>
                                    </div>
                                </div>

                                {/* Date Presets */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-main mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Period
                                    </label>
                                    <PeriodSelect
                                        datePreset={filters.datePreset}
                                        dateFrom={filters.date_from}
                                        dateTo={filters.date_to}
                                        onPresetChange={applyPreset}
                                        onDateFromChange={(value) => updateFilter("date_from", value)}
                                        onDateToChange={(value) => updateFilter("date_to", value)}
                                    />
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
                                        `${budgets.length} budgets found`
                                    )}
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setFilters({
                                                search: '',
                                                account_id: '',
                                                category_id: '',
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

            {/* BUDGET CARDS CONTAINER */}
            <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-main">
                            Your Budgets ({showLoading ? "..." : budgets.length})
                        </h2>

                        <div className="flex items-center gap-4">
                            {/* Show Budget Summary button only when an account is selected */}
                            {isAccountSelected() && (
                                <button
                                    onClick={() => setBudgetSummaryModal(true)}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-main hover:border-button hover:bg-button hover:text-white transition-colors"
                                >
                                    <PieChart className="w-4 h-4" />
                                    Budget Summary
                                </button>
                            )}
                            <span className="text-sm text-text-secondary">
                                {showLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Loading budgets...
                                    </div>
                                ) : (
                                    `Showing ${budgets.length} budgets`
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Budget Cards Grid */}
                <div className={`grid ${mobileVP ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"} gap-5 p-5`}>
                    {showLoading ? (
                        // Loading state
                        Array.from({ length: 6 }).map((_, index) => (
                            <LoadingCard key={index} />
                        ))
                    ) : budgets.length > 0 ? (
                        budgets.map((budget) => {
                            const amount = Number(budget.budget_amount) || 0;
                            const spent = Number(budget.budget_spent) || 0;
                            const progress = Math.min((spent / amount) * 100, 100);
                            const remaining = amount - spent;
                            const isOver = remaining < 0;
                            const dailyAvg = spent / 20;

                            return (
                                <div
                                    key={budget.id}
                                    className="bg-white border border-border rounded-xl shadow-sm hover:shadow-lg transition-all p-5 flex flex-col hover:scale-102"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-main">{budget.category?.category_name}</h3>
                                                <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(
                                                        budget.status
                                                    )}`}
                                                >
                                                    {budget.status}
                                                </span>
                                            </div>

                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditBudgetModal(true);
                                                    setBudgetID(budget.id);
                                                }}
                                                className="cursor-pointer p-2 text-edit hover:bg-edit/10 rounded-lg transition-colors"
                                                title="Edit Budget"
                                            >
                                                <SquarePen className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteConfirmation(
                                                    budget.id, 
                                                    budget.category?.category_name || "Uncategorized Budget",
                                                    budget.account?.account_name || "Unknown Account"
                                                )}
                                                className="cursor-pointer p-2 text-expense hover:bg-expense/10 rounded-lg transition-colors"
                                                title="Delete Budget"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2 mt-2">
                                        <span className="font-medium text-text bg-blue-300 px-1 py-0.5 rounded-md">{budget.account?.account_name}</span>
                                        <span>•</span>
                                        <span>{formatDate(budget.start_date)} - {formatDate(budget.end_date)}</span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center text-sm mb-2">
                                            <span className="text-text">Spent</span>
                                            <span className="font-semibold text-main">
                                                ${spent.toFixed(2)} / ${budget.budget_amount}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 border border-gray-400 rounded-full h-2 mb-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 bg-linear-to-r from-main-light to-income`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-text">
                                                {progress.toFixed(1)}%
                                            </span>
                                            <span className={`font-medium text-main`}>
                                                {isOver
                                                    ? `$${Math.abs(remaining).toFixed(2)} over`
                                                    : `$${remaining.toFixed(2)} remaining`
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Footer */}
                                    <div className="mt-auto pt-4 border-t border-border">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="text-center">
                                                <p className="text-text-secondary text-xs">Progress</p>
                                                <p className="font-semibold text-main">{progress.toFixed(1)}%</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-text-secondary text-xs">Daily Avg</p>
                                                <p className="font-semibold text-main">${dailyAvg.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setBudgetTransactionsModal(true);
                                                    setBudgetID(budget.id);
                                                }}
                                                className="cursor-pointer text-center rounded-lg p-2 transition-all duration-300 bg-main-light/90 hover:bg-main"
                                            >
                                                <p className="text-xs text-white">
                                                    Transactions
                                                </p>
                                                <p className="font-semibold text-white">
                                                    {budget.transactions?.length || 0}
                                                </p>
                                            </button>

                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-icon" />
                            </div>
                            <h3 className="text-lg font-semibold text-main mb-2">No Budgets Found</h3>
                            <p className="text-text-secondary mb-6 max-w-md">
                                Create your first budget to start tracking your spending against limits.
                            </p>
                            <button
                                onClick={() => setBudgetModal(true)}
                                className="cursor-pointer px-4 py-2 bg-button text-white rounded-lg hover:bg-hover-button transition-colors"
                            >
                                <Plus className="w-4 h-4 inline mr-2" />
                                Create Budget
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <BudgetModal isOpen={budgetModal} onClose={() => setBudgetModal(false)} />
            <EditBudgetModal
                isOpen={editBudgetModal}
                onClose={() => {
                    setEditBudgetModal(false);
                    setBudgetID(null);
                }}
                budgetID={budgetID}
            />
            <BudgetTransactionsModal
                budgetID={budgetID}
                onClose={() => {
                    setBudgetTransactionsModal(false);
                    setBudgetID(null);
                }}
                isOpen={budgetTransactionsModal}
            />

            <BudgetSummary
                isOpen={budgetSummaryModal}
                onClose={() => setBudgetSummaryModal(false)}
                budgets={getFilteredBudgetsForSummary()}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={confirmDelete.isOpen}
                title="Delete Budget"
                text={`Are you sure you want to delete the budget "${confirmDelete.budgetName}" from account "${confirmDelete.accountName}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                destructive={true}
                isLoading={deleteBudget.isLoading}
                onSubmit={handleDeleteBudget}
                onClose={() => setConfirmDelete({ 
                    isOpen: false, 
                    budgetId: null, 
                    budgetName: "", 
                    accountName: "" 
                })}
            />
        </div>
    );
}