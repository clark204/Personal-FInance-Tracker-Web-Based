import React, { useState } from "react";
import { Plus, Filter, ChevronDown, Trash2, CheckCircle, SquarePen } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import BudgetModal from "../modal/BudgetModal";
import { useBudget } from "../../hooks/budget";
import EditBudgetModal from "../modal/EditBudgetModal";
import BudgetTransactionsModal from "../modal/BudgetTransactionsModal";
import { useAccount } from "../../hooks/account";
import CategoryFilter from "../common/CategoryFilter";
import AccountFilter from "../common/AccountFilter";
import PeriodSelect from "../common/PeriodSelect";

export default function Budget() {

    const [filters, setFilters] = useState({
        account_id: "",
        category_id: "",
        status: "",
        datePreset: "",
        date_from: "",
        page: 1,
        date_to: "",
    });

    const updateFilter = (field, value) => {
        setFilters((prev) => ({
            ...prev,
            [field]: value,
            page: field === "page" ? value : 1
        }));
    };

    const mobileVP = useMediaQuery({ maxWidth: 768 });
    const [isFiltersOpen, setIsFiltersOpen] = useState(true);

    const [budgetModal, setBudgetModal] = useState(false);
    const [editBudgetModal, setEditBudgetModal] = useState(false);
    const [budgetTransactionsModal, setBudgetTransactionsModal] = useState(false);
    const [budgetID, setBudgetID] = useState(null);

    const { getBudgets } = useBudget(null, filters);
    const budgets = getBudgets.data?.data || [];

    const statusColor = (status) => {
        switch (status) {
            case "ontrack":
                return "text-[#109442] bg-[#C9F5D9]";
            case "completed":
                return "text-[#0B2027] bg-[#FAFDED]";
            case "Overspend":
                return "text-[#F44336] bg-[#FCD6D3]";
            case "Expired":
                return "text-gray-600 bg-gray-200";
            default:
                return "text-slate-600 bg-slate-200";
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

        // if (preset === "today") {
        //     start.setHours(0, 0, 0, 0);
        //     updateFilter("date_from", start.toISOString().slice(0, 10));
        //     updateFilter("date_to", now.toISOString().slice(0, 10));
        // }

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

    return (
        <div className="h-screen p-4 sm:p-6 bg-linear-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md border border-border">
                <div>
                    <h1 className="text-2xl font-semibold text-main">Budgets</h1>
                    <p className="text-text-secondary text-sm">Overview of your current spending</p>
                </div>
                <button
                    onClick={() => setBudgetModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-button text-white rounded-md hover:bg-hover-button transition"
                >
                    <Plus className="w-4 h-4" />
                    Add Budget
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-md border border-border mb-6">
                <div className="w-full flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className={`text-icon ${mobileVP ? "w-4 h-4" : "w-5 h-5"}`} />
                        <h2 className={`font-semibold ${mobileVP ? "text-base" : "text-lg"}`}>Filters</h2>
                    </div>

                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className="flex items-center text-sm text-text hover:font-medium cursor-pointer transition"
                    >
                        {isFiltersOpen ? "Hide" : "Show"}
                        <ChevronDown
                            className={`ml-1 transition-transform  ${isFiltersOpen ? "rotate-180" : ""} 
                        ${mobileVP ? "w-3 h-3" : "w-4 h-4"}`}
                        />
                    </button>
                </div>

                {/* Collapsible Content */}
                {isFiltersOpen && (
                    <div
                        className={` ${isFiltersOpen ? "max-h-[600px]" : "max-h-0"} `}
                    >
                        <div
                            className=" grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 "
                        >
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

                            {/* Status */}
                            <div>
                                <label className="text-sm text-text block mb-1">Status</label>
                                <select className="w-full px-3 py-2 border border-border rounded-lg"
                                    value={filters.status}
                                    onChange={(e) => updateFilter("status", e.target.value)}
                                >
                                    <option value="">All status</option>
                                    <option value="ontrack">On Track</option>
                                    <option value="overspend">Overspend</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Period */}
                            <PeriodSelect
                                datePreset={filters.datePreset}
                                dateFrom={filters.date_from}
                                dateTo={filters.date_to}
                                onPresetChange={applyPreset}
                                onDateFromChange={(value) => updateFilter("date_from", value)}
                                onDateToChange={(value) => updateFilter("date_to", value)}
                            />
                        </div>

                        {/* Clear FIlter Actions */}
                        <div className="flex justify-end pt-4 border-t mt-4">
                            <button
                                onClick={() => {
                                    // Reset all filters to default values
                                    setFilters({
                                        account_id: '',
                                        category_id: '',
                                        status: '',
                                        datePreset: '', // or whatever your default preset is
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

            <div className="bg-white p-6 rounded-xl shadow-md border border-border min-h-[450px] flex flex-col">
                {/* Budget Cards */}
                <div className={`grid ${mobileVP ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3"} gap-5 overflow-auto`}>
                    {budgets.map((budget) => {
                        const amount = Number(budget.budget_amount) || 0;
                        const spent = Number(budget.budget_spent) || 0;

                        const progress = Math.min((spent / amount) * 100, 100);
                        const remaining = amount - spent;
                        const isOver = remaining < 0;

                        return (
                            <div
                                key={budget.id}
                                className="bg-white border border-border rounded-xl shadow-sm hover:shadow-lg transition p-5 flex flex-col"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-text">{budget.account?.account_name}</h3>
                                        <h3 className="text-md font-semibold text-text">{budget.category?.category_name}</h3>
                                        <p className="text-sm text-text-secondary">{budget.start_date} - {budget.end_date}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(
                                                budget.status
                                            )}`}
                                        >
                                            {budget.status}
                                        </span>
                                        <SquarePen
                                            onClick={() => {
                                                setEditBudgetModal(true);
                                                setBudgetID(budget.id);
                                            }}
                                            className="w-4 h-4 text-edit hover:text-blue-700 cursor-pointer" size={18} />
                                        <Trash2 className="w-4 h-4 text-expense cursor-pointer hover:text-red-700 transition" size={18} />
                                    </div>
                                </div>

                                {/* PROGRESS */}
                                <div className="mt-4">
                                    <p className="text-sm text-text/70 mb-1">Spent</p>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-text font-semibold">
                                            ${spent.toFixed(2)} of ${budget.budget_amount}
                                        </span>
                                    </div>
                                    <div className="w-full bg-border rounded-full h-2 mt-1 mb-2">
                                        <div
                                            className="bg-linear-to-r from-main-light to-income h-2 rounded-full"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-text-secondary">
                                        {isOver
                                            ? `$${Math.abs(remaining).toFixed(2)} over`
                                            : `$${remaining.toFixed(2)} remaining`}
                                    </p>
                                </div>

                                <hr className="my-1 border-border" />

                                <div className="flex justify-between text-xs text-text-secondary">
                                    <div>
                                        <span>Progress</span>
                                        <p className="text-text font-medium text-center">{progress.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <span>Daily Avg</span>
                                        <p className="text-text font-medium text-center">
                                            ${(spent / 20).toFixed(2)}
                                        </p>
                                    </div>
                                    <div
                                        className="text-center cursor-pointer"
                                        onClick={() => {
                                            setBudgetTransactionsModal(true);
                                            setBudgetID(budget.id);
                                        }}
                                    >
                                        <span>Transactions</span>
                                        <p className="text-text font-medium">{budget.transactions?.length}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-auto pt-6 text-sm text-text-secondary">
                    <button className="px-2 py-1 border border-border rounded hover:bg-primary-gradient/40 transition">
                        Previous
                    </button>
                    <span className="px-3 py-1 bg-main text-white rounded">1</span>
                    <span>2</span>
                    <span>3</span>
                    <button className="px-2 py-1 border border-border rounded hover:bg-primary-gradient/40 transition">
                        Next
                    </button>
                </div>
            </div>

            <BudgetModal isOpen={budgetModal} onClose={() => setBudgetModal(false)} />
            <EditBudgetModal isOpen={editBudgetModal} onClose={() => {
                setEditBudgetModal(false);
                setBudgetID(null);
            }} budgetID={budgetID} />
            <BudgetTransactionsModal budgetID={budgetID} onClose={() => {
                setBudgetTransactionsModal(false);
                setBudgetID(null);
            }} isOpen={budgetTransactionsModal} />
        </div >
    );
}
