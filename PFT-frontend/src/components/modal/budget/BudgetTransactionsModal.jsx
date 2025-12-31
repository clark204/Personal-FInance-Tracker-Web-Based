import { AnimatePresence, motion } from "framer-motion";
import { useBudget } from "../../../hooks/budget";
import { X, Receipt, Calendar, Tag, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { useMemo } from "react";

export default function BudgetTransactionsModal({ budgetID, onClose, isOpen }) {
    const { showBudget } = useBudget(budgetID);
    const budget = showBudget?.data || {};
    const transactions = budget.transactions || [];

    // Safely calculate values with defaults
    const budgetSpent = useMemo(() => {
        const spent = budget.budget_spent;
        return typeof spent === 'number' ? spent : 
               typeof spent === 'string' ? parseFloat(spent) || 0 : 0;
    }, [budget.budget_spent]);

    const budgetAmount = useMemo(() => {
        const amount = budget.budget_amount;
        return typeof amount === 'number' ? amount : 
               typeof amount === 'string' ? parseFloat(amount) || 0 : 0;
    }, [budget.budget_amount]);

    const spentPercentage = useMemo(() => {
        if (budgetAmount > 0) {
            return Math.min((budgetSpent / budgetAmount) * 100, 100);
        }
        return 0;
    }, [budgetSpent, budgetAmount]);

    // FIXED: Use lowercase comparison for transaction type
    const totalSpent = useMemo(() => {
        return transactions
            .filter(t => t.type?.toLowerCase() === 'expense')
            .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    }, [transactions]);

    if (!isOpen || budgetID == null) return null;

    const isLoading = showBudget?.isLoading;

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    {/* Modal - Compact size */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ 
                                type: "tween",
                                duration: 0.2,
                                ease: "easeOut"
                            }}
                            className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 pointer-events-auto max-h-[80vh] flex flex-col"
                        >
                            {/* Compact Header */}
                            <div className="bg-gradient-to-r from-primary-gradient to-secondary-gradient border-b border-border/30 p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-2">
                                        <div className="p-1.5 bg-white rounded-md border border-gray-200 mt-0.5">
                                            <Receipt className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-text line-clamp-1">
                                                {budget.category?.category_name || "Transactions"}
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 hover:bg-white/50 rounded-md cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-4 h-4 text-text" />
                                    </button>
                                </div>
                            </div>

                            {/* Budget Info */}
                            <div className="p-3 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5 text-icon" />
                                        <span className="font-medium text-gray-700">Budget Usage</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold text-gray-900">
                                            ${budgetSpent.toFixed(2)}
                                            <span className="text-gray-600"> / ${budgetAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="text-gray-600">{spentPercentage.toFixed(1)}% spent</div>
                                    </div>
                                </div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                            spentPercentage > 80 ? 'bg-expense' : 'bg-income'
                                        }`}
                                        style={{ width: `${spentPercentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-3 text-sm text-gray-600">Loading transactions...</p>
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <div className="space-y-2">
                                        {transactions.map((transaction) => {
                                            const amount = parseFloat(transaction.amount) || 0;
                                            const type = transaction.type?.toLowerCase();
                                            return (
                                                <div 
                                                    key={transaction.id}
                                                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <div className={`p-2 rounded-md ${
                                                        type === 'income' 
                                                            ? 'bg-income/10 text-income' 
                                                            : 'bg-expense/10 text-expense'
                                                    }`}>
                                                        {type === 'income' ? (
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {transaction.description || "No description"}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Calendar className="w-3 h-3 text-gray-400" />
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(transaction.date).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                    {transaction.account && (
                                                                        <p className="text-xs text-gray-500">
                                                                            • {transaction.account.account_name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className={`text-sm font-semibold ${
                                                                    type === 'income' ? 'text-income' : 'text-expense'
                                                                }`}>
                                                                    {type === 'income' ? '+' : '-'}${amount.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Receipt className="w-12 h-12 text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500 text-center">
                                            No transactions found for this budget category yet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer Stats */}
                            {transactions.length > 0 && (
                                <div className="border-t border-gray-200 p-3 bg-gray-50">
                                    <div className="flex justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5 text-gray-600" />
                                            <span className="font-medium text-gray-700">Total Spent</span>
                                        </div>
                                        <div className="font-semibold text-gray-900">
                                            ${totalSpent.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Close Button */}
                            <div className="p-3 border-t border-gray-200">
                                <button
                                    onClick={onClose}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm 
                                             font-medium hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}