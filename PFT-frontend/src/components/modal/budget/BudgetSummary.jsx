import { AnimatePresence, motion } from "framer-motion";
import { X, TrendingUp, Target, Calendar, PieChart, DollarSign, CheckCircle, AlertTriangle, BarChart } from "lucide-react";

export default function BudgetSummary({ isOpen, onClose, budgets = [] }) {
    // Get currency symbol from first budget's account info
    const getCurrencySymbol = () => {
        if (budgets.length > 0 && budgets[0].account?.currency?.symbol) {
            return budgets[0].account.currency.symbol;
        }
        return "$"; // Default fallback
    };

    const currencySymbol = getCurrencySymbol();

    // Calculate summary statistics
    const totalBudgets = budgets.length;
    const ontrackBudgets = budgets.filter(b => b.status === "ontrack").length;
    const overbudgetBudgets = budgets.filter(b => b.status === "overbudget").length;
    const completedBudgets = budgets.filter(b => b.status === "completed").length;
    const overdueBudgets = budgets.filter(b => b.status === "overdue").length;

    const totalAllocated = budgets.reduce((sum, budget) => sum + parseFloat(budget.budget_amount || 0), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + parseFloat(budget.budget_spent || 0), 0);
    const overallSpentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    // Calculate amount remaining
    const amountRemaining = totalAllocated - totalSpent;
    const averageSpentPercentage = budgets.length > 0
        ? budgets.reduce((sum, budget) => {
            const spent = parseFloat(budget.budget_spent) || 0;
            const allocated = parseFloat(budget.budget_amount) || 0;
            const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
            return sum + Math.min(percentage, 100);
        }, 0) / budgets.length
        : 0;

    // Find budgets ending soon (within next 7 days)
    const endingSoonBudgets = budgets
        .filter(budget => budget.status !== "completed" && budget.end_date)
        .filter(budget => {
            const endDate = new Date(budget.end_date);
            const today = new Date();
            const diffTime = endDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays >= 0 && diffDays <= 7;
        })
        .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
        .slice(0, 3);

    // Calculate average daily spending across all budgets
    const today = new Date();
    const totalDays = budgets.reduce((sum, budget) => {
        if (!budget.start_date || !budget.end_date) return sum;
        
        const start = new Date(budget.start_date);
        const end = new Date(budget.end_date);
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        return sum + days;
    }, 0);

    const averageDailySpending = totalDays > 0 ? totalSpent / totalDays : 0;

    // Format currency with symbol
    const formatCurrency = (amount) => {
        return `${currencySymbol}${parseFloat(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Function to get budget's currency symbol
    const getBudgetCurrencySymbol = (budget) => {
        return budget.account?.currency?.symbol || currencySymbol;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Fixed Header */}
                            <div className="bg-gradient-to-r from-main to-main-light p-6 flex-shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <PieChart className="w-6 h-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Budget Summary</h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-white/90">
                                    Overview of your budgets and spending progress
                                </p>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <Target className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-medium text-blue-700">Total Budgets</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-900">{totalBudgets}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(ontrackBudgets / totalBudgets) * 100 || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-blue-700 whitespace-nowrap">
                                                {ontrackBudgets} on track
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-green-500/20 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span className="text-sm font-medium text-green-700">On Track</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-900">{ontrackBudgets}</p>
                                        <p className="text-sm text-green-700 mt-2">
                                            {totalBudgets > 0 ? `${((ontrackBudgets / totalBudgets) * 100).toFixed(1)}% staying within budget` : 'No budgets'}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <DollarSign className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-medium text-purple-700">Total Spent</span>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {formatCurrency(totalSpent)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <TrendingUp className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm text-purple-700">
                                                {overallSpentPercentage.toFixed(1)}% of allocated
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                                <DollarSign className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <span className="text-sm font-medium text-amber-700">Available</span>
                                        </div>
                                        <p className="text-2xl font-bold text-amber-900">
                                            {formatCurrency(amountRemaining)}
                                        </p>
                                        <p className="text-sm text-amber-700 mt-2">
                                            {amountRemaining > 0 ? 'Remaining across all budgets' : 'All budgets exhausted!'}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Overall Progress */}
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <BarChart className="w-5 h-5 text-main" />
                                            Spending Progress
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>Overall Spending</span>
                                                    <span className="font-medium">{overallSpentPercentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${overallSpentPercentage}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={`h-full rounded-full ${overallSpentPercentage > 100 ? 'bg-gradient-to-r from-expense to-red-600' : 'bg-gradient-to-r from-main-light to-main'}`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>Average Budget Progress</span>
                                                    <span className="font-medium">{averageSpentPercentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${averageSpentPercentage}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Average Daily Spending</span>
                                                    <span className="text-sm font-medium text-main">{formatCurrency(averageDailySpending)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Distribution */}
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <PieChart className="w-5 h-5 text-main" />
                                            Status Distribution
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { status: 'On Track', count: ontrackBudgets, color: 'bg-income', textColor: 'text-income' },
                                                { status: 'Over Budget', count: overbudgetBudgets, color: 'bg-expense', textColor: 'text-expense' },
                                                { status: 'Completed', count: completedBudgets, color: 'bg-main', textColor: 'text-main' },
                                                { status: 'Overdue', count: overdueBudgets, color: 'bg-accounts', textColor: 'text-accounts' },
                                            ].map((item) => (
                                                <div key={item.status} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                                        <span className="text-sm text-gray-700">{item.status}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-medium ${item.textColor}`}>
                                                            {item.count}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            ({totalBudgets > 0 ? `${((item.count / totalBudgets) * 100).toFixed(1)}%` : '0%'})
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Budgets Ending Soon */}
                                {endingSoonBudgets.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-5 mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-main" />
                                            Budgets Ending Soon
                                        </h3>
                                        <div className="space-y-3">
                                            {endingSoonBudgets.map((budget) => {
                                                const endDate = new Date(budget.end_date);
                                                const today = new Date();
                                                const diffTime = endDate - today;
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                const budgetCurrencySymbol = getBudgetCurrencySymbol(budget);
                                                const spent = parseFloat(budget.budget_spent) || 0;
                                                const allocated = parseFloat(budget.budget_amount) || 0;
                                                const spentPercentage = allocated > 0 ? (spent / allocated) * 100 : 0;

                                                return (
                                                    <div key={budget.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-gray-800">{budget.category?.category_name}</h4>
                                                                <span className={`px-2 py-1 text-xs rounded-full ${diffDays <= 3 ? 'bg-expense/20 text-expense' : 'bg-amber-100 text-amber-700'}`}>
                                                                    {diffDays <= 0 ? 'Ended' : `${diffDays} days left`}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {budget.account?.account_name || 'No account'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-gray-900">
                                                                {budgetCurrencySymbol}{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {budgetCurrencySymbol}{allocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {spentPercentage.toFixed(1)}% spent
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Over Budget Alerts */}
                                {overbudgetBudgets > 0 && (
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-expense" />
                                            Over Budget Alerts
                                        </h3>
                                        <div className="space-y-3">
                                            {budgets
                                                .filter(b => b.status === "overbudget")
                                                .slice(0, 3)
                                                .map((budget) => {
                                                    const budgetCurrencySymbol = getBudgetCurrencySymbol(budget);
                                                    const spent = parseFloat(budget.budget_spent) || 0;
                                                    const allocated = parseFloat(budget.budget_amount) || 0;
                                                    const overspent = spent - allocated;

                                                    return (
                                                        <div key={budget.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-medium text-gray-800">{budget.category?.category_name}</h4>
                                                                    <span className="px-2 py-1 text-xs rounded-full bg-expense/20 text-expense">
                                                                        Over Budget
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    Exceeded by {budgetCurrencySymbol}{Math.abs(overspent).toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-expense">
                                                                    {budgetCurrencySymbol}{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    of {budgetCurrencySymbol}{allocated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {budgets.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                            <Target className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Budgets Yet</h3>
                                        <p className="text-gray-600 max-w-md mx-auto">
                                            Start creating budgets to see your spending summary here. 
                                            Track your expenses and stay within your limits!
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Fixed Footer */}
                            <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-600">
                                        Last updated: {new Date().toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 bg-main text-white rounded-lg hover:bg-main-dark transition-colors font-medium"
                                    >
                                        Close Summary
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}