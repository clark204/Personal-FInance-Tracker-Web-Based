import { AnimatePresence, motion } from "framer-motion";
import { useBudget } from "../../hooks/budget";
import { X } from "lucide-react";

export default function BudgetTransactionsModal({ budgetID, onClose, isOpen }) {
    const { showBudget } = useBudget(budgetID);
    const budget = showBudget?.data || {};

    if (!isOpen || budgetID == null) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center-safe justify-center bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-2xl max-w-lg min-h-96 w-full p-6 relative overflow-y-auto"
                >
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <div className="w-full">
                            <h2 className="text-lg font-semibold text-gray-900 flex justify-between">
                                {budget.category?.category_name} Transactions
                                <span className="px-2 py-1 text-xs border border-border rounded-full mr-4">
                                    {budget.transactions?.length} Transaction{(budget.transactions?.length < 1) ? "s" : ""}
                                </span>
                            </h2>
                            <p id="transaction-desc" className="text-sm text-text-secondary">
                                All expense transactions in this budget category
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-text-secondary/50 rounded-full transition"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-text" />
                        </button>
                    </div>
                    <div className="">
                        {budget.transactions && budget.transactions.length > 0 ? (
                            <ul>
                                {budget.transactions.map((transaction) => (
                                    <li key={transaction.id}
                                        className="flex justify-between items-center border border-border p-2 rounded-lg mb-2"
                                    >
                                        <div className="w-full">
                                            <div className="flex gap-4">
                                                <p className="text-text font-medium">{budget.category.category_name}</p>
                                                <p className="text-text font-medium">{}</p>
                                            </div>
                                            <div className="flex">
                                                <p className="text-text-secondary text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                                                <p className="text-text font-semibold ml-12">{transaction.description || "-"}</p>
                                            </div>
                                        </div>
                                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                            <p>{transaction.type === 'income' ? '+' : '-'}${transaction?.amount}</p>
                                            <p></p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-text-secondary">No transactions found for this budget category.</p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}