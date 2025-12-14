import { useState } from "react";
import {
    Filter,
    MoreHorizontal,
    ChevronDown,
    SquarePen,
    Trash2
} from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { useTransaction } from "../../hooks/transaction";
import EditTransactionModal from "../modal/EditTransactionModal";
import CategoryFilter from "../common/CategoryFilter";
import { useAccount } from "../../hooks/account";
import AccountFilter from "../common/AccountFilter";
import PeriodSelect from "../common/PeriodSelect";

export default function Transaction() {

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    // Show/Hide filter section
    const [showFilters, setShowFilters] = useState(true);

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

    const presets = [
        { value: "all", label: "All dates" },
        { value: "today", label: "Today" },
        { value: "week", label: "This Week" },
        { value: "month", label: "This Month" },
        { value: "year", label: "This Year" },
        { value: "custom", label: "Custom Range" }
    ];

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

    const { getTransactions } = useTransaction(null, filters);

    const transactions = getTransactions.data?.data || [];
    const pagination = getTransactions.data?.pagination || {
        current_page: 1,
        last_page: 1,
        per_page: 8,
        total: 0
    };

    const updateFilter = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: field === "page" ? value : 1
        }));
    };

    // Check if transaction is editable (within 48 hours)
    const isEditable = (transactionDate) => {
        const transactionTime = new Date(transactionDate).getTime();
        const now = new Date().getTime();
        const diffInHours = (now - transactionTime) / (1000 * 60 * 60);
        return diffInHours <= 48;
    };

    const [editTransaction, setEditTransaction] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState(null);

    return (
        <div
            className={`p-4 md:p-6 space-y-6 bg-linear-to-b from-primary-gradient to-secondary-gradient h-screen overflow-auto text-text 
            ${mobileVP ? "text-sm" : ""}`}
        >

            {/* HEADER */}
            <div className="flex items-center flex-col mb-4 bg-white p-4 rounded-xl shadow-md border border-border">
                <div className="w-full flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className={`text-icon ${mobileVP ? "w-4 h-4" : "w-5 h-5"}`} />
                        <h2 className={`font-semibold ${mobileVP ? "text-base" : "text-lg"}`}>Filters</h2>
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center text-sm text-text hover:font-medium cursor-pointer transition"
                    >
                        {showFilters ? "Hide" : "Show"}
                        <ChevronDown
                            className={`ml-1 transition-transform  ${showFilters ? "rotate-180" : ""} 
                        ${mobileVP ? "w-3 h-3" : "w-4 h-4"}`}
                        />
                    </button>
                </div>
                {/* FILTERS */}
                {showFilters && (
                    <div className={`grid gap-4 animate-fadeIn w-full
                    ${mobileVP ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"}
                `}>
                        {/* Search */}
                        <div className="col-span-2">
                            <label className="text-sm block mb-1 text-text ">Search</label>
                            <input
                                type="text"
                                placeholder="Search description..."
                                value={filters.search}
                                onChange={(e) => updateFilter("search", e.target.value)}
                                className="w-full border border-border bg-white rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Account */}
                        <AccountFilter
                            selectedAccount={filters.account_id}
                            onSelect={(value) => updateFilter("account_id", value)}
                        />

                        {/* Category */}
                        <CategoryFilter
                            selectedCategory={filters.category_id}
                            onSelect={(value) => updateFilter("category_id", value)}
                        />

                        {/* Type */}
                        <div>
                            <label className="text-sm text-text block mb-1">Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => updateFilter("type", e.target.value)}
                                className="w-full border border-border bg-white rounded-md px-3 py-2"
                            >
                                <option value="">All type</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>

                        {/* Date Presets */}
                        <PeriodSelect
                            datePreset={filters.datePreset}
                            dateFrom={filters.date_from}
                            dateTo={filters.date_to}
                            onPresetChange={applyPreset}
                            onDateFromChange={(value) => updateFilter("date_from", value)}
                            onDateToChange={(value) => updateFilter("date_to", value)}
                        />

                        <div className="col-span-4 flex justify-end gap-3 pt-4 border-t">
                            <button
                                onClick={() => {
                                    // Reset all filters to default values
                                    setFilters({
                                        search: '',
                                        account_id: '',
                                        category_id: '',
                                        type: '',
                                        datePreset: 'all', // or whatever your default preset is
                                        date_from: '',
                                        date_to: ''
                                    });
                                }}
                                className="px-5 text-sm hover:font-medium rounded-lg  text-text/70
                             hover:text-red-500 transition cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* TRANSACTION LIST */}
            <div className="bg-white rounded-xl shadow-md border border-border p-4 md:p-5 min-h-[70vh] flex flex-col ">

                <h2 className={`font-semibold mb-4 ${mobileVP ? "text-base" : "text-lg"}`}>
                    Transactions ( {pagination.total} )
                </h2>

                {/* MOBILE: CARD LIST */}
                {mobileVP && (
                    <div className="space-y-2 overflow-auto">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="p-3 rounded-lg border border-border bg-gray-50 flex flex-col gap-1"
                            >
                                <div className="flex justify-between">
                                    <span className="font-semibold">{tx.account.account_name}</span>
                                    <span>
                                        {isEditable(tx.date) && (
                                            <SquarePen className="cursor-pointer p-1 text-edit bg-edit/20 rounded-md"
                                                onClick={() => {
                                                    setEditTransaction(true);
                                                    setSelectedTransactionID(tx.id);
                                                }}
                                                size={28}
                                            />
                                        )}
                                    </span>
                                    <span className="">
                                        <Trash2 className="cursor-pointer text-expense bg-expense/20 p-1 rounded-md" size={28} />
                                    </span>
                                </div>




                                <div className="flex justify-between text-sm text-text">
                                    <span className="font-medium">
                                        {tx.category?.category_name ?? "-"}
                                    </span>
                                    <span className={`font-bold px-2 rounded-lg ${tx.type === 'income' ? 'text-income bg-income/20' : 'text-expense bg-expense/20'}`}>
                                        {tx.type == 'income' ? '+' : '-'} ₱{Number(tx.amount).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <p className="text-text overflow-x-auto whitespace-nowrap max-w-16">
                                        {tx.description ?? "-"}
                                    </p>
                                    <span className="text-text-secondary mr-2">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* DESKTOP: TABLE */}
                {!mobileVP && (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-[#FAFAFC] text-left text-sm text-text">
                                    <th className="py-2 px-4">Date</th>
                                    <th className="py-2 px-4">Description</th>
                                    <th className="py-2 px-4">Category</th>
                                    <th className="py-2 px-4 text-right">Amount</th>
                                    <th className="py-2 px-4">Type</th>
                                    <th className="py-2 px-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((transaction) => (
                                    <tr key={transaction.id} className="text-sm hover:bg-[#FAFAFC]">
                                        <td className="py-2 px-4">
                                            {new Date(transaction.date).toLocaleDateString()}
                                        </td>
                                        <td className="py-2 px-4">
                                            {transaction.description ?? "-"}
                                        </td>
                                        <td className="py-2 px-4">
                                            {transaction.category?.category_name ?? "-"}
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            <span className={`px-2 py-1 rounded-lg ${transaction.type === 'Income' ? 'text-income bg-income/20' : 'text-expense bg-expense/20'}`}>
                                                {transaction.type == 'Income' ? '+' : '-'} ₱{Number(transaction.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-1 rounded-lg ${transaction.type === 'Income' ? 'text-income bg-income/20' : 'text-expense bg-expense/20'}`}>
                                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                            </span>
                                        </td>
                                        <td className="flex justify-end gap-4 py-2 px-4">
                                            <span>
                                                {isEditable(transaction.date) && (
                                                    <SquarePen className="cursor-pointer p-1 text-edit bg-edit/20 rounded-md"
                                                        onClick={() => {
                                                            setEditTransaction(true);
                                                            setSelectedTransactionID(transaction.id);
                                                        }}
                                                        size={28}
                                                    />
                                                )}
                                            </span>
                                            <span>
                                                <Trash2 className="cursor-pointer text-expense bg-expense/20 p-1 rounded-md" size={28} />
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className={`flex justify-between mt-auto ${mobileVP ? "text-xs" : "text-sm"}`}>
                    <button
                        disabled={pagination.current_page === 1}
                        className="px-3 py-1 bg-button text-white rounded disabled:opacity-40"
                        onClick={() => updateFilter("page", pagination.current_page - 1)}
                    >
                        Prev
                    </button>

                    <p className="text-text-secondary">
                        Page {pagination.current_page} of {pagination.last_page}
                    </p>

                    <button
                        disabled={pagination.current_page === pagination.last_page}
                        className="px-3 py-1 bg-button text-white rounded disabled:opacity-40"
                        onClick={() => updateFilter("page", pagination.current_page + 1)}
                    >
                        Next
                    </button>
                </div>
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
        </div>
    );
}
