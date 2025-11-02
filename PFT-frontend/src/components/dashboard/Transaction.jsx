import { useState } from "react";
import {
    Filter,
    Search,
    MoreHorizontal,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useMediaQuery } from "react-responsive";

export default function Transaction() {
    const mockTransactions = [
        { id: "1", date: "2025-10-20", description: "Salary", category: "Income", amount: 5000, type: "income" },
        { id: "2", date: "2025-10-19", description: "Grocery Shopping", category: "Food", amount: 150, type: "expense" },
        { id: "3", date: "2025-10-18", description: "Electric Bill", category: "Utilities", amount: 85, type: "expense" },
        { id: "4", date: "2025-10-17", description: "Netflix", category: "Entertainment", amount: 15, type: "expense" },
        { id: "5", date: "2025-10-16", description: "Water Bill", category: "Utilities", amount: 30, type: "expense" },
        { id: "6", date: "2025-10-15", description: "Dinner Out", category: "Food", amount: 45, type: "expense" },
        { id: "7", date: "2025-10-14", description: "Freelance Work", category: "Income", amount: 300, type: "income" },
        { id: "8", date: "2025-10-13", description: "Coffee", category: "Food", amount: 5, type: "expense" },
        { id: "9", date: "2025-10-12", description: "Taxi", category: "Transportation", amount: 20, type: "expense" },
        { id: "10", date: "2025-10-11", description: "Phone Bill", category: "Utilities", amount: 50, type: "expense" },
        { id: "11", date: "2025-10-10", description: "Gym", category: "Health", amount: 40, type: "expense" },
    ];

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const filteredTransactions = mockTransactions.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const currentRecords = filteredTransactions.slice(startIndex, startIndex + recordsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gradient-to-b from-primary-gradient to-secondary-gradient h-screen overflow-auto text-text">
            {/* Filter Section */}
            <div className="bg-white rounded-xl shadow-md border border-border p-4 md:p-5 text-text">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-icon" />
                    <h2 className="font-semibold text-lg">Filters</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-1 sm:col-span-2 md:col-span-1">
                        <label className="text-sm text-text-secondary block mb-1">Search</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full border border-border bg-white text-text rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Category</label>
                        <select className="w-full border border-border bg-white text-text rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none">
                            <option>All</option>
                            <option>Food</option>
                            <option>Utilities</option>
                            <option>Transportation</option>
                            <option>Income</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Type</label>
                        <select className="w-full border border-border bg-white text-text rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none">
                            <option>All</option>
                            <option>Income</option>
                            <option>Expense</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-text-secondary block mb-1">Date</label>
                        <select className="w-full border border-border bg-white text-text rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-focus outline-none">
                            <option>All Time</option>
                            <option>This Week</option>
                            <option>Last Week</option>
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 border-t border-border pt-3 gap-2">
                    <button className="flex items-center text-sm text-text-secondary hover:text-text">
                        Advanced Filters
                        <ChevronDown className="w-4 h-4 ml-1" />
                    </button>

                    <button className="text-sm text-text-secondary hover:text-red-500">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-xl shadow-md border border-border p-4 md:p-5 text-text">
                <h2 className="font-semibold text-lg mb-4">
                    Transactions ({filteredTransactions.length})
                </h2>

                {mobileVP ? (
                    <div className="space-y-3">
                        {currentRecords.length === 0 ? (
                            <p className="text-center text-text-secondary py-6">No transactions found</p>
                        ) : (
                            currentRecords.map((t) => (
                                <div key={t.id} className="border border-border bg-main rounded-lg p-3 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{t.description}</p>
                                            <p className="text-xs text-text-secondary">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${t.type === "income"
                                                ? "bg-green-200 text-green-800"
                                                : "bg-red-200 text-red-800"
                                                }`}
                                        >
                                            {t.type}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm text-text-secondary">{t.category}</p>
                                        <p className="font-semibold">${t.amount.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse rounded-2xl">
                            <thead>
                                <tr className="bg-main text-left text-sm text-text-secondary">
                                    <th className="py-2 px-4 border-b border-border">Date</th>
                                    <th className="py-2 px-4 border-b border-border">Description</th>
                                    <th className="py-2 px-4 border-b border-border">Category</th>
                                    <th className="py-2 px-4 border-b border-border text-right">Amount</th>
                                    <th className="py-2 px-4 border-b border-border">Type</th>
                                    <th className="py-2 px-4 border-b border-border text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecords.map((transaction) => (
                                    <tr key={transaction.id} className="text-sm hover:bg-main hover:text-white transition">
                                        <td className="py-2 px-4 border-b border-border">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-2 px-4 border-b border-border">{transaction.description}</td>
                                        <td className="py-2 px-4 border-b border-border">{transaction.category}</td>
                                        <td className="py-2 px-4 border-b border-border text-right">
                                            ${transaction.amount.toFixed(2)}
                                        </td>
                                        <td className="py-2 px-4 border-b border-border">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${transaction.type === "income"
                                                    ? "bg-green-200 text-green-800"
                                                    : "bg-red-200 text-red-800"
                                                    }`}
                                            >
                                                {transaction.type}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 border-b border-border text-right">
                                            <button className="p-1 rounded hover:bg-main">
                                                <MoreHorizontal className="w-4 h-4 text-icon" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {filteredTransactions.length > recordsPerPage && (
                    <div className="flex items-center justify-between mt-4">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 text-sm px-3 py-1 border border-border rounded-md disabled:opacity-50 bg-button hover:bg-hover-button text-white transition"
                        >
                            <ChevronLeft className="w-4 h-4" /> Prev
                        </button>

                        <p className="text-sm text-text-secondary">
                            Page {currentPage} of {totalPages}
                        </p>

                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 text-sm px-3 py-1 border border-border rounded-md disabled:opacity-50 bg-button hover:bg-hover-button text-white transition"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
