// pages/Overview.js
import { Wallet, Filter, Calendar } from "lucide-react";
import IncomeExpenseChart from "../overview/IncomeExpenseChart";
import SpendingCategoryChart from "../overview/SpendingCategoryChart";
import BudgetOverview from "../overview/BudgetOverview";
import GoalOverview from "../overview/GoalOverview";
import RecentTransactions from "../overview/RecentTransaction";
import { useOutletContext } from "react-router-dom";

export default function Overview() {
    const { overviewFilter } = useOutletContext();
    const { filters, applyPreset, updateFilter } = overviewFilter;

    const presets = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'last_week', label: 'Last Week' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'last_year', label: 'Last Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    return (
        <div className="h-screen overflow-auto bg-linear-to-b from-primary-gradient to-secondary-gradient">
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Global Filter Header */}
                <div className="mb-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-300 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                            <p className="text-gray-600 mt-1">Track your finances across all components</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Preset Selector */}
                            <div className="w-full md:w-64">
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    <Filter className="w-4 h-4 inline mr-1" />
                                    Filter Period
                                </label>
                                <select
                                    value={filters.datePreset}
                                    onChange={(e) => applyPreset(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-white text-sm 
                                             focus:ring-2 focus:ring-income outline-none"
                                >
                                    {presets.map(preset => (
                                        <option key={preset.value} value={preset.value}>
                                            {preset.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Date Range (shown only when custom is selected) */}
                            {filters.datePreset === 'custom' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:w-96">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date From
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_from || ''}
                                            onChange={(e) => updateFilter('date_from', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date To
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_to || ''}
                                            onChange={(e) => updateFilter('date_to', e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm 
                                                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selected Period Display */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing data from: <span className="font-medium text-gray-900">
                                {new Date(filters.date_from).toLocaleDateString()} to {new Date(filters.date_to).toLocaleDateString()}
                            </span>
                        </p>
                    </div>
                </div>
                {/* Recent Transactions */}
                <div className="mb-6">
                    <RecentTransactions filters={filters} />
                </div>

                {/* Charts Grid */}
                {/* Charts Grid with gap-4 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    {/* Left column - Top to Bottom */}
                    <div className="space-y-4">
                        <IncomeExpenseChart filters={filters} />
                        <BudgetOverview filters={filters} />
                    </div>

                    {/* Right column - Top to Bottom */}
                    <div className="space-y-4">
                        <SpendingCategoryChart filters={filters} />
                        <GoalOverview filters={filters} />
                    </div>
                </div>

            </main>
        </div>
    );
}