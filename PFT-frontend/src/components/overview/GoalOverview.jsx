import React, { useState } from "react";
import { MoreVertical, Target } from "lucide-react";

const goals = [
    { id: 1, name: "Emergency Fund", current: 8000, target: 10000, deadline: "2025-12-31", status: "active" },
    { id: 2, name: "Vacation to Japan", current: 3500, target: 5000, deadline: "2025-08-15", status: "active" },
    { id: 3, name: "New Laptop", current: 1200, target: 2000, deadline: "2025-06-30", status: "active" },
    { id: 4, name: "Investment Fund", current: 5000, target: 5000, deadline: "2025-03-01", status: "completed" },
    { id: 5, name: "Home Down Payment", current: 15000, target: 50000, deadline: "2026-12-31", status: "active" },
    { id: 6, name: "Car Repair Fund", current: 800, target: 1500, deadline: "2025-05-15", status: "active" },
];

const ITEMS_PER_PAGE = 3;

export default function GoalOverview() {
    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [menuOpen, setMenuOpen] = useState(false);

    const filtered = filter === "all" ? goals : goals.filter(g => g.status === filter);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const formatDate = d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="bg-white p-5 rounded-xl shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative">
                <h2 className="font-semibold text-lg">Goal Overview</h2>
                <div className="relative">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical size={18} />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-10">
                            {["all", "active", "completed"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setFilter(t);
                                        setCurrentPage(1);
                                        setMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${filter === t ? "font-semibold" : ""}`}
                                >
                                    {t === "all" ? "All Goals" : t === "active" ? "Active Goals" : "Completed Goals"}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Goals */}
            <div className="space-y-6">
                {paginated.map(g => {
                    const progress = Math.round((g.current / g.target) * 100);
                    return (
                        <div key={g.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">{g.name}</p>
                                        <p className="text-sm text-gray-500">Deadline: {formatDate(g.deadline)}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs px-3 py-1 rounded-full ${g.status === "completed" ? "bg-green-200 text-green-800" : "bg-blue-200 text-blue-800"
                                        }`}
                                >
                                    {g.status === "completed" ? "Completed" : "Active"}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>${g.current.toLocaleString()} / ${g.target.toLocaleString()}</span>
                                <span>{progress}%</span>
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
