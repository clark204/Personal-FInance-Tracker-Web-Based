import React, { useState } from "react";
import { MoreVertical } from "lucide-react";

const budgets = [
    { id: 1, category: "Food & Dining", spent: 1200, budget: 1500, status: "good" },
    { id: 2, category: "Transportation", spent: 450, budget: 500, status: "good" },
    { id: 3, category: "Entertainment", spent: 700, budget: 800, status: "good" },
    { id: 4, category: "Healthcare", spent: 300, budget: 600, status: "good" },
    { id: 5, category: "Shopping", spent: 1800, budget: 1500, status: "over" },
    { id: 6, category: "Bills & Utilities", spent: 1400, budget: 1500, status: "warning" },
    { id: 7, category: "Education", spent: 500, budget: 1000, status: "good" },
];

const ITEMS_PER_PAGE = 3;

export default function BudgetOverview() {
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);

    const filtered = filter === "all" ? budgets : budgets.filter(b => b.status === filter);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const getBadgeColor = s =>
        s === "over" ? "bg-red-500 text-white" :
            s === "warning" ? "bg-yellow-400 text-black" : "bg-green-500 text-white";

    const getBadgeLabel = s =>
        s === "over" ? "Over Budget" :
            s === "warning" ? "Near Limit" : "On Track";

    return (
        <div className="bg-white p-5 rounded-xl shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
                <h2 className="font-semibold text-lg">Budget Overview</h2>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical size={18} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-10">
                            {["all", "good", "warning", "over"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setFilter(t);
                                        setCurrentPage(1);
                                        setMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${filter === t ? "font-semibold" : ""}`}
                                >
                                    {t === "all" ? "All Budgets" :
                                        t === "good" ? "On Track" :
                                            t === "warning" ? "Near Limit" : "Over Budget"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Budget list */}
            <div className="space-y-5">
                {paginated.map(b => (
                    <div key={b.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{b.category}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(b.status)}`}>
                                {getBadgeLabel(b.status)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>${b.spent} / ${b.budget}</span>
                            <span>{Math.round((b.spent / b.budget) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${b.status === "over"
                                        ? "bg-red-500"
                                        : b.status === "warning"
                                            ? "bg-yellow-400"
                                            : "bg-green-500"
                                    }`}
                                style={{ width: `${Math.min((b.spent / b.budget) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-6 text-sm">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={`px-3 py-1 rounded border ${currentPage === 1 ? "opacity-50" : "hover:bg-gray-100"}`}
                    >
                        Prev
                    </button>
                    <span>
                        Page {currentPage} / {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={`px-3 py-1 rounded border ${currentPage === totalPages ? "opacity-50" : "hover:bg-gray-100"}`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
