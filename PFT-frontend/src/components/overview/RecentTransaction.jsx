import { useState } from "react";
import { MoreVertical, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function RecentTransactions() {
    const transactions = [
        { id: 1, date: "2025-10-21", description: "Salary Deposit", amount: 5000, type: "income", category: "Income" },
        { id: 2, date: "2025-10-20", description: "Grocery Store", amount: -120, type: "expense", category: "Food & Dining" },
        { id: 3, date: "2025-10-19", description: "Netflix Subscription", amount: -15.99, type: "expense", category: "Entertainment" },
        { id: 4, date: "2025-10-18", description: "Gas Station", amount: -45, type: "expense", category: "Transportation" },
        { id: 5, date: "2025-10-17", description: "Freelance Project", amount: 800, type: "income", category: "Income" },
        { id: 6, date: "2025-10-16", description: "Online Shopping", amount: -250, type: "expense", category: "Shopping" },
        { id: 7, date: "2025-10-15", description: "Electric Bill", amount: -85, type: "expense", category: "Bills & Utilities" },
    ];

    const ITEMS_PER_PAGE = 5;
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getFilteredTransactions = () => {
        if (filter === "all") return transactions;
        return transactions.filter((t) => t.type === filter);
    };

    const filteredTransactions = getFilteredTransactions();
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const handleFilterChange = (type) => {
        setFilter(type);
        setCurrentPage(1);
        setIsMenuOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>

                {/* Dropdown Filter */}
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <MoreVertical className="size-5 text-gray-600" />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-44 z-10">
                            <button
                                onClick={() => handleFilterChange("all")}
                                className={`block w-full text-left px-4 py-2 rounded-t-lg transition ${filter === "all" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                                    }`}
                            >
                                All Transactions
                            </button>
                            <button
                                onClick={() => handleFilterChange("income")}
                                className={`block w-full text-left px-4 py-2 transition ${filter === "income" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                                    }`}
                            >
                                Income Only
                            </button>
                            <button
                                onClick={() => handleFilterChange("expense")}
                                className={`block w-full text-left px-4 py-2 rounded-b-lg transition ${filter === "expense" ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                                    }`}
                            >
                                Expenses Only
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <table className="min-w-full border-collapse text-sm text-gray-700">
                <thead>
                    <tr className="border-b border-gray-200 text-gray-600">
                        <th className="text-left py-2">Date</th>
                        <th className="text-left py-2">Description</th>
                        <th className="text-left py-2">Category</th>
                        <th className="text-right py-2">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedTransactions.map((t) => (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="py-2">{formatDate(t.date)}</td>
                            <td className="py-2 flex items-center gap-2">
                                {t.type === "income" ? (
                                    <ArrowDownRight className="size-4 text-green-600" />
                                ) : (
                                    <ArrowUpRight className="size-4 text-red-500" />
                                )}
                                {t.description}
                            </td>
                            <td className="py-2">
                                <span className="border border-gray-200 px-2 py-1 text-xs rounded-md bg-gray-50">
                                    {t.category}
                                </span>
                            </td>
                            <td className="py-2 text-right font-medium">
                                <span className={t.type === "income" ? "text-green-600" : "text-red-500"}>
                                    {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toFixed(2)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded-md border text-sm ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                            }`}
                    >
                        Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-md border text-sm ${currentPage === page ? "bg-green-500 text-white" : "hover:bg-gray-100"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded-md border text-sm ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
