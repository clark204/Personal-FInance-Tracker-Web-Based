import { AnimatePresence, motion } from "framer-motion";
import { X, TrendingUp, Target, Calendar, PieChart, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SavingsSummary({ isOpen, onClose, goals = [] }) {

    // Get currency symbol from first goal's account info
    const getCurrencySymbol = () => {
        if (goals.length > 0 && goals[0].account?.currency?.symbol) {
            return goals[0].account.currency.symbol;
        }
        return "$"; // Default fallback
    };

    const currencySymbol = getCurrencySymbol();

    // Calculate summary statistics
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === "active").length;
    const reachedGoals = goals.filter(g => g.status === "reached").length;
    const pausedGoals = goals.filter(g => g.status === "paused").length;

    const totalTarget = goals.reduce((sum, goal) => sum + parseFloat(goal.target_amount || 0), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + parseFloat(goal.saved_amount || 0), 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    // Calculate amount needed
    const amountNeeded = totalTarget - totalSaved;

    // Find upcoming deadlines
    const upcomingGoals = goals
        .filter(goal => goal.status === "active" && goal.deadline)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3);

    // Calculate average progress
    const averageProgress = goals.length > 0
        ? goals.reduce((sum, goal) => {
            const progress = parseFloat(goal.saved_amount) / parseFloat(goal.target_amount) * 100;
            return sum + Math.min(progress, 100);
        }, 0) / goals.length
        : 0;

    // Format currency with symbol
    const formatCurrency = (amount) => {
        return `${currencySymbol}${parseFloat(amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Function to get goal's currency symbol
    const getGoalCurrencySymbol = (goal) => {
        return goal.account?.currency?.symbol || currencySymbol;
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

                        {/* Modal Content - Made height constrained and content scrollable */}
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
                                        <h2 className="text-2xl font-bold text-white">Savings Summary</h2>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-white/90">
                                    Overview of your savings goals and progress
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
                                            <span className="text-sm font-medium text-blue-700">Total Goals</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-900">{totalGoals}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${(activeGoals / totalGoals) * 100 || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-blue-700 whitespace-nowrap">
                                                {activeGoals} active
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-green-500/20 rounded-lg">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                            <span className="text-sm font-medium text-green-700">Reached</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-900">{reachedGoals}</p>
                                        <p className="text-sm text-green-700 mt-2">
                                            {totalGoals > 0 ? `${((reachedGoals / totalGoals) * 100).toFixed(1)}% success rate` : 'No goals'}
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <DollarSign className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <span className="text-sm font-medium text-purple-700">Total Saved</span>
                                        </div>
                                        <p className="text-2xl font-bold text-purple-900">
                                            {formatCurrency(totalSaved)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <TrendingUp className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm text-purple-700">
                                                {overallProgress.toFixed(1)}% of target
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                                <Target className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <span className="text-sm font-medium text-amber-700">To Save</span>
                                        </div>
                                        <p className="text-2xl font-bold text-amber-900">
                                            {formatCurrency(amountNeeded)}
                                        </p>
                                        <p className="text-sm text-amber-700 mt-2">
                                            {amountNeeded > 0 ? 'Remaining to reach all goals' : 'All goals funded!'}
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Overview */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Overall Progress */}
                                    <div className="bg-gray-50 rounded-xl p-5">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-main" />
                                            Overall Progress
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>Total Progress</span>
                                                    <span className="font-medium">{overallProgress.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${overallProgress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className="h-full bg-gradient-to-r from-main-light to-main rounded-full"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>Average Goal Progress</span>
                                                    <span className="font-medium">{averageProgress.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${averageProgress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                                                    />
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
                                                { status: 'Active', count: activeGoals, color: 'bg-income', textColor: 'text-income' },
                                                { status: 'Reached', count: reachedGoals, color: 'bg-main', textColor: 'text-main' },
                                                { status: 'Paused', count: pausedGoals, color: 'bg-accounts', textColor: 'text-accounts' },
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
                                                            ({totalGoals > 0 ? `${((item.count / totalGoals) * 100).toFixed(1)}%` : '0%'})
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Deadlines */}
                                {upcomingGoals.length > 0 && (
                                    <div className="bg-gray-50 rounded-xl p-5 mb-8">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-main" />
                                            Upcoming Deadlines
                                        </h3>
                                        <div className="space-y-3">
                                            {upcomingGoals.map((goal) => {
                                                const deadline = new Date(goal.deadline);
                                                const today = new Date();
                                                const diffTime = deadline - today;
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                const goalCurrencySymbol = getGoalCurrencySymbol(goal);

                                                return (
                                                    <div key={goal.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium text-gray-800">{goal.savings_name}</h4>
                                                                <span className={`px-2 py-1 text-xs rounded-full ${diffDays <= 7 ? 'bg-expense/20 text-expense' : 'bg-blue-100 text-blue-700'}`}>
                                                                    {diffDays <= 0 ? 'Overdue' : `${diffDays} days left`}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {goal.description || 'No description'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-gray-900">
                                                                {goalCurrencySymbol}{parseFloat(goal.saved_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {goalCurrencySymbol}{parseFloat(goal.target_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                {((parseFloat(goal.saved_amount) / parseFloat(goal.target_amount)) * 100).toFixed(1)}% complete
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {goals.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                            <Target className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Savings Goals Yet</h3>
                                        <p className="text-gray-600 max-w-md mx-auto">
                                            Start creating savings goals to see your progress summary here.
                                            Track your financial targets and watch your savings grow!
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