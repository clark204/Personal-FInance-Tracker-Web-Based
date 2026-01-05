import { useState, useMemo } from "react";
import { MoreVertical, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useAccount } from "../../hooks/account";

export default function RecentTransactions({ filters }) {
    const { showAccount } = useAccount(filters.account_id);
    
    // Get account data which includes transactions with categories
    const accountInfo = showAccount.data?.data;
    const transactions = accountInfo?.transactions || [];
    
    const ITEMS_PER_PAGE = 5;
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Extract currency symbol from account info - this always works
    const currencySymbol = useMemo(() => {
        // Get from account info (always available when account is loaded)
        if (accountInfo?.currency?.symbol) {
            return accountInfo.currency.symbol;
        }
        
        // Fallback: from transactions (if any)
        if (transactions.length > 0) {
            const firstTransaction = transactions[0];
            if (firstTransaction?.account?.currency?.symbol) {
                return firstTransaction.account.currency.symbol;
            }
        }
        
        // Ultimate fallback
        return "$";
    }, [accountInfo, transactions]);

    // Filter transactions based on date range and type
    const filteredTransactions = useMemo(() => {
        let result = transactions;
        
        // Apply date filter
        if (filters.date_from && filters.date_to) {
            const from = new Date(filters.date_from);
            const to = new Date(filters.date_to);
            
            result = result.filter(item => {
                const itemDate = new Date(item.transaction_date || item.date);
                return itemDate >= from && itemDate <= to;
            });
        }
        
        // Apply type filter
        if (filter !== "all") {
            result = result.filter(item => item.type === filter);
        }
        
        // Sort by date (newest first)
        return result.sort((a, b) => {
            const dateA = new Date(a.transaction_date || a.date);
            const dateB = new Date(b.transaction_date || b.date);
            return dateB - dateA;
        });
    }, [transactions, filters, filter]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", { 
                month: "short", 
                day: "numeric", 
                year: "numeric" 
            });
        } catch (error) {
            return "Invalid date";
        }
    };

    const handleFilterChange = (type) => {
        setFilter(type);
        setCurrentPage(1);
        setIsMenuOpen(false);
    };

    // Get account name for display
    const getAccountName = () => {
        return accountInfo?.account_name || "Unknown Account";
    };

    // Get category name for a transaction
    const getCategoryName = (transaction) => {
        return transaction.category?.category_name || "Uncategorized";
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg border border-border">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Dropdown Filter */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full hover:text-9xl transition-all"
                            aria-label="Filter menu"
                            aria-expanded={isMenuOpen}
                        >
                            <MoreVertical className="size-5 text-text" />
                        </button>

                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-48 z-20">
                                    <button
                                        onClick={() => handleFilterChange("all")}
                                        className={`block w-full text-left px-4 py-3 rounded-t-lg transition ${filter === "all" ? "bg-gray-100 font-semibold text-gray-900" : "hover:bg-gray-50 text-gray-700"}`}
                                    >
                                        All Transactions
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange("Income")}
                                        className={`block w-full text-left px-4 py-3 transition ${filter === "Income" ? "bg-green-50 font-semibold text-green-700" : "hover:bg-gray-50 text-gray-700"}`}
                                    >
                                        Income Only
                                    </button>
                                    <button
                                        onClick={() => handleFilterChange("Expense")}
                                        className={`block w-full text-left px-4 py-3 rounded-b-lg transition ${filter === "Expense" ? "bg-red-50 font-semibold text-red-700" : "hover:bg-gray-50 text-gray-700"}`}
                                    >
                                        Expenses Only
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-10">
                    <div className="text-4xl mb-4">💳</div>
                    <p className="text-lg font-medium text-gray-700">No transactions found</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {filter !== "all" ? `No ${filter.toLowerCase()} transactions` : 'No transactions recorded for this period'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-600">
                                    <th className="text-left py-3 pl-4">Date</th>
                                    <th className="text-left py-3">Description</th>
                                    <th className="text-left py-3">Category</th>
                                    <th className="text-left py-3">Account</th>
                                    <th className="text-right py-3 pr-4">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTransactions.map((t) => (
                                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-200 transition-all">
                                        <td className="py-3 pl-4">
                                            {formatDate(t.transaction_date || t.date)}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                {t.type === "Income" ? (
                                                    <ArrowDownRight className="size-4 text-green-600" />
                                                ) : (
                                                    <ArrowUpRight className="size-4 text-red-500" />
                                                )}
                                                <span>{t.description || "No description"}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className="border border-gray-200 px-2 py-1 text-xs rounded-md bg-gray-50">
                                                {getCategoryName(t)}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className="text-sm text-gray-600">
                                                {getAccountName()}
                                            </span>
                                        </td>
                                        <td className="py-3 text-right pr-4 font-medium">
                                            <span className={t.type === "Income" ? "text-green-600" : "text-red-500"}>
                                                {t.type === "Income" ? "+" : "-"}
                                                {currencySymbol}{Math.abs(parseFloat(t.amount || 0)).toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-600">
                                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1.5 rounded-md border text-sm transition ${currentPage === 1 
                                        ? "opacity-50 cursor-not-allowed bg-gray-100" 
                                        : "hover:bg-gray-100 hover:border-gray-300"
                                    }`}
                                >
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-md border text-sm transition ${currentPage === pageNum 
                                                    ? "bg-green-500 text-white border-green-500" 
                                                    : "hover:bg-gray-100 hover:border-gray-300"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    {totalPages > 5 && currentPage < totalPages - 2 && (
                                        <>
                                            <span className="px-1">...</span>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                className={`px-3 py-1.5 rounded-md border text-sm transition ${currentPage === totalPages 
                                                    ? "bg-green-500 text-white border-green-500" 
                                                    : "hover:bg-gray-100 hover:border-gray-300"
                                                }`}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1.5 rounded-md border text-sm transition ${currentPage === totalPages 
                                        ? "opacity-50 cursor-not-allowed bg-gray-100" 
                                        : "hover:bg-gray-100 hover:border-gray-300"
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}