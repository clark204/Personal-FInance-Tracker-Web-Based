import { useState, useEffect } from "react";
import {
    Filter,
    ChevronDown,
    SquarePen,
    Trash2,
    Search,
    Calendar,
    Wallet,
    Tag,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    Loader
} from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { useTransaction } from "../../hooks/transaction";
import EditTransactionModal from "../modal/EditTransactionModal";
import CategoryFilter from "../common/CategoryFilter";
import AccountFilter from "../common/AccountFilter";
import PeriodSelect from "../common/PeriodSelect";
import ConfirmModal from "../common/confirmModal";

export default function Transaction() {
    const mobileVP = useMediaQuery({ maxWidth: 768 });
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        transactionId: null,
        transactionDescription: ""
    });
    const [showFilters, setShowFilters] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        account_id: "",
        category_id: "",
        type: "",
        date_from: "",
        date_to: "",
        search: "",
        page: 1,
        datePreset: "all"
    });

    function applyPreset(preset) {
        const now = new Date();
        const start = new Date();

        if (preset === "today") {
            start.setHours(0, 0, 0, 0);
            updateFilter("date_from", start.toISOString().slice(0, 10));
            updateFilter("date_to", now.toISOString().slice(0, 10));
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

    const { getTransactions, deleteTransaction } = useTransaction(null, filters);
    const transactions = getTransactions.data?.data || [];
    const pagination = getTransactions.data?.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0
    };

    useEffect(() => {
        if (getTransactions.data || getTransactions.error) {
            setIsLoading(false);
        }
    }, [getTransactions.data, getTransactions.error]);

    const updateFilter = (field, value) => {
        setIsLoading(true);
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: field === "page" ? value : 1
        }));
    };

    const isEditable = (transactionDate) => {
        const transactionTime = new Date(transactionDate).getTime();
        const now = new Date().getTime();
        const diffInHours = (now - transactionTime) / (1000 * 60 * 60);
        return diffInHours <= 48;
    };

    const [editTransaction, setEditTransaction] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState(null);

    // Handle delete transaction
    const handleDeleteTransaction = async () => {
        if (confirmDelete.transactionId) {
            await deleteTransaction.mutateAsync(confirmDelete.transactionId);
            setConfirmDelete({ isOpen: false, transactionId: null, transactionDescription: "" });
        }
    };

    // Open delete confirmation
    const openDeleteConfirmation = (transactionId, transactionDescription) => {
        setConfirmDelete({
            isOpen: true,
            transactionId,
            transactionDescription: transactionDescription || "this transaction"
        });
    };

    // Loading skeleton for mobile view
    const MobileLoadingSkeleton = () => (
        <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4 rounded-lg border border-border animate-pulse">
                    <div className="flex justify-between items-start mb-3">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <div className="h-3 w-40 bg-gray-200 rounded"></div>
                            <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    // Loading skeleton for desktop table
    const DesktopLoadingSkeleton = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-primary-gradient">
                    <tr>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Date</th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Description</th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Category</th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Account</th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Type</th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Amount</th>
                        <th className="py-3 px-6 text-left text-sm font-semibold text-main">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                            <td className="py-4 px-6">
                                <div className="h-4 w-20 bg-gray-200 rounded"></div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="h-4 w-40 bg-gray-200 rounded"></div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                </div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex gap-2">
                                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                    <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-linear-to-b from-primary-gradient to-secondary-gradient overflow-auto">
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
                            className="flex items-center gap-1 text-sm text-text-secondary hover:text-main transition-colors"
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
                                            placeholder="Search transactions..."
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
                                {/* Type Filter */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2">Type</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateFilter("type", "")}
                                            className={`flex-1 px-4 py-2.5 rounded-lg border transition ${!filters.type ? 'bg-button text-white border-button' : 'bg-white border-border text-main hover:border-button'}`}
                                        >
                                            All
                                        </button>
                                        <button
                                            onClick={() => updateFilter("type", "Income")}
                                            className={`flex-1 px-4 py-2.5 rounded-lg border transition ${filters.type === "Income" ? 'bg-income text-white border-income' : 'bg-white border-border text-main hover:border-income'}`}
                                        >
                                            Income
                                        </button>
                                        <button
                                            onClick={() => updateFilter("type", "Expense")}
                                            className={`flex-1 px-4 py-2.5 rounded-lg border transition ${filters.type === "Expense" ? 'bg-expense text-white border-expense' : 'bg-white border-border text-main hover:border-expense'}`}
                                        >
                                            Expense
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
                                    {isLoading ? "Loading..." : `${transactions.length} transactions found`}
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsLoading(true);
                                            setFilters({
                                                search: '',
                                                account_id: '',
                                                category_id: '',
                                                type: '',
                                                datePreset: 'all',
                                                date_from: '',
                                                date_to: '',
                                                page: 1
                                            });
                                        }}
                                        className="px-5 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:border-expense hover:text-expense transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TRANSACTIONS TABLE CARD */}
            <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
                <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-main">
                            All Transactions ({isLoading ? "..." : pagination.total})
                        </h2>
                        <div className="flex items-center gap-4">
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader className="w-4 h-4 animate-spin text-text-secondary" />
                                    <span className="text-sm text-text-secondary">Loading...</span>
                                </div>
                            ) : (
                                <span className="text-sm text-text-secondary">
                                    Showing {transactions.length} of {pagination.total}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    mobileVP ? (
                        <MobileLoadingSkeleton />
                    ) : (
                        <DesktopLoadingSkeleton />
                    )
                ) : (
                    <>
                        {/* MOBILE VIEW */}
                        {mobileVP ? (
                            transactions.length > 0 ? (
                                <div className="p-4 space-y-3">
                                    {transactions.map((tx) => (
                                        <div key={tx.id} className="p-4 rounded-lg border border-border hover:bg-primary-gradient transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-medium text-main">
                                                        {tx.account?.account_name || "Uncategorized"}
                                                    </p>
                                                    <p className="text-sm text-text-secondary mt-1">
                                                        {new Date(tx.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {isEditable(tx.date) && (
                                                        <button
                                                            onClick={() => {
                                                                setEditTransaction(true);
                                                                setSelectedTransactionID(tx.id);
                                                            }}
                                                            className="p-2 text-edit hover:bg-edit/10 rounded-lg transition-colors"
                                                        >
                                                            <SquarePen className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openDeleteConfirmation(
                                                            tx.id,
                                                            tx.description || `Transaction from ${tx.account?.account_name}`
                                                        )}
                                                        className="p-2 text-expense hover:bg-expense/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-text-secondary">
                                                        {tx.description || "No description"}
                                                    </p>
                                                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-secondary-gradient text-icon mt-2">
                                                        {tx.category?.category_name || "Uncategorized"}
                                                    </span>
                                                </div>
                                                <span className={`text-lg font-bold ${tx.type === 'Income' ? 'text-income' : 'text-expense'}`}>
                                                    {tx.type === 'Income' ? '+' : '-'}₱{Number(tx.amount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter className="w-8 h-8 text-icon" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-main mb-2">No Transactions Found</h3>
                                    <p className="text-text-secondary mb-4">Try adjusting your filters to find what you're looking for.</p>
                                </div>
                            )
                        ) : (
                            /* DESKTOP VIEW */
                            <div className="overflow-x-auto">
                                {transactions.length > 0 ? (
                                    <table className="w-full">
                                        <thead className="bg-primary-gradient">
                                            <tr>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Date</th>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Description</th>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Category</th>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Account</th>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Type</th>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Amount</th>
                                                <th className="py-3 px-6 text-left text-sm font-semibold text-main">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {transactions.map((tx) => (
                                                <tr key={tx.id} className="hover:bg-primary-gradient transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="text-sm text-main">
                                                            {new Date(tx.date).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="max-w-xs">
                                                            <p className="text-sm text-main truncate">
                                                                {tx.description || "No description"}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary-gradient text-icon">
                                                            {tx.category?.category_name || "Uncategorized"}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <Wallet className="w-4 h-4 text-accounts" />
                                                            <span className="text-sm text-main">
                                                                {tx.account?.account_name || "Unknown"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${tx.type === 'Income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                                                            {tx.type === 'Income' ? (
                                                                <ArrowUpRight className="w-3 h-3" />
                                                            ) : (
                                                                <ArrowDownRight className="w-3 h-3" />
                                                            )}
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`text-sm font-semibold ${tx.type === 'Income' ? 'text-income' : 'text-expense'}`}>
                                                            {tx.type === 'Income' ? '+' : '-'}₱{Number(tx.amount).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex gap-2">
                                                            {isEditable(tx.date) && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditTransaction(true);
                                                                        setSelectedTransactionID(tx.id);
                                                                    }}
                                                                    className="p-2 text-edit hover:bg-edit/10 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <SquarePen className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                className="p-2 text-expense hover:bg-expense/10 rounded-lg transition-colors"
                                                                title="Delete"
                                                                onClick={() => openDeleteConfirmation(
                                                                    tx.id,
                                                                    tx.description || `Transaction from ${tx.account?.account_name}`
                                                                )}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Filter className="w-8 h-8 text-icon" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-main mb-2">No Transactions Found</h3>
                                        <p className="text-text-secondary mb-4">Try adjusting your filters to find what you're looking for.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PAGINATION */}
                        {!isLoading && pagination.last_page > 1 && (
                            <div className="p-5 border-t border-border">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-text-secondary">
                                        Page {pagination.current_page} of {pagination.last_page} • {pagination.total} total transactions
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateFilter("page", pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-main hover:border-button hover:bg-button/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => updateFilter("page", pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-main hover:border-button hover:bg-button/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Edit Transaction Modal */}
            {editTransaction && (
                <EditTransactionModal
                    isOpen={editTransaction}
                    onClose={() => {
                        setEditTransaction(false);
                        setSelectedTransactionID(null);
                    }}
                    transactionID={selectedTransactionID}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={confirmDelete.isOpen}
                title="Confirm Action"
                text={`Are you sure you want to delete "${confirmDelete.transactionDescription}"?`}
                confirmText="Confirm"
                cancelText="Cancel"
                type="danger"
                destructive={true}
                isLoading={deleteTransaction.isLoading}
                onSubmit={handleDeleteTransaction}
                onClose={() => setConfirmDelete({
                    isOpen: false,
                    transactionId: null,
                    transactionDescription: ""
                })}
            />
        </div>
    );
}