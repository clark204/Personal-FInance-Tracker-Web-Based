import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, PiggyBank, TrendingUp, TrendingDown, Wallet, FileText } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSavings } from "../../../hooks/savings";

export default function EditGoalModal({ isOpen, onClose, ID }) {
    const { showSaving, updateSaving } = useSavings(ID);
    const savings = showSaving.data?.data || null;    
    const account = showSaving.data?.account || null;
    
    const [formData, setFormData] = useState({
        goalName: "",
        targetAmount: "",
        deadline: "",
        description: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when savings data loads
    useEffect(() => {
        if (savings) {
            let formattedDeadline = "";
            if (savings.deadline) {
                const date = new Date(savings.deadline);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                formattedDeadline = `${year}-${month}-${day}`;
            }

            setFormData({
                goalName: savings.savings_name || "",
                targetAmount: savings.target_amount || "",
                deadline: formattedDeadline,
                description: savings.description || ""
            });
        }
    }, [savings]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const updatedData = {
            savings_name: formData.goalName.trim(),
            target_amount: parseFloat(formData.targetAmount),
            deadline: formData.deadline || null,
            description: formData.description.trim() || null,
        };
        
        try {
            await updateSaving.mutateAsync(updatedData);
            onClose();
        } catch (error) {
            console.error("Failed to update goal:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, updateSaving, onClose, isSubmitting]);

    // Calculate progress
    const progress = savings && parseFloat(savings.target_amount) > 0
        ? (parseFloat(savings.saved_amount) / parseFloat(savings.target_amount)) * 100
        : 0;

    // Show loading state
    if (showSaving.isLoading) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center"
                    >
                        <div className="bg-white rounded-lg p-8 text-center">
                            <div className="w-10 h-10 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-sm text-gray-600">Loading savings data...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    if (!ID || !savings) return null;

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
                        onClick={isSubmitting ? undefined : onClose}
                    />

                    {/* Modal */}
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
                            className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden border border-gray-200 pointer-events-auto max-h-[90vh] flex flex-col"
                        >
                            {/* Compact Header */}
                            <div className="bg-gradient-to-r from-primary-gradient to-secondary-gradient border-b border-border/30 p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white rounded-md border border-gray-200">
                                            <PiggyBank className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-text">
                                                Edit Savings Goal
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                Update goal details and track progress
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="p-1.5 hover:bg-white/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-4 h-4 text-text" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left Column - Form */}
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            {/* Goal Name */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                    Goal Name *
                                                </label>
                                                <div className="relative">
                                                    <PiggyBank className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        name="goalName"
                                                        value={formData.goalName}
                                                        onChange={handleInputChange}
                                                        disabled={isSubmitting}
                                                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                                focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Target Amount */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                    Target Amount *
                                                </label>
                                                <div className="relative">
                                                    <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        name="targetAmount"
                                                        value={formData.targetAmount}
                                                        onChange={handleInputChange}
                                                        disabled={isSubmitting}
                                                        min="0.01"
                                                        step="0.01"
                                                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                                focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Deadline */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                    Deadline
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                    <input
                                                        type="date"
                                                        name="deadline"
                                                        value={formData.deadline}
                                                        onChange={handleInputChange}
                                                        disabled={isSubmitting}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                                focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                                disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                    Description
                                                </label>
                                                <div className="relative">
                                                    <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400" />
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        disabled={isSubmitting}
                                                        className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                                focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                                disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                                                        rows="3"
                                                        placeholder="Add description..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Card - Compact */}
                                        <div className="bg-gradient-to-r from-main-light to-main rounded-lg p-3 mt-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-xs text-white opacity-90">Current Balance</p>
                                                    <p className="text-lg font-bold text-income">
                                                        ${parseFloat(savings.saved_amount).toFixed(2)}
                                                    </p>
                                                </div>
                                                <PiggyBank className="w-8 h-8 text-blue-300" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs text-white">
                                                    <span>Progress</span>
                                                    <span>{progress.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-400 to-income h-1.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min(progress, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-xs text-white text-center pt-1">
                                                    ${parseFloat(savings.saved_amount).toFixed(0)} of ${parseFloat(savings.target_amount).toFixed(0)} target
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Info */}
                                    <div className="space-y-4">
                                        {/* Account Info */}
                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wallet className="w-4 h-4 text-icon" />
                                                <span className="text-xs font-medium text-gray-700">Linked Account</span>
                                            </div>
                                            <p className="text-sm font-semibold text-main-light truncate">
                                                {account.account_name || 'No Account'}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                {account.type || ''} • Balance: ${parseFloat(account.balance || 0).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Recent Transactions */}
                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-icon" />
                                                <span className="text-xs font-medium text-gray-700">Recent Transactions</span>
                                            </div>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {savings.savings_transactions?.slice(0, 3).map((tx, index) => (
                                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                                                        <div>
                                                            <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                                                            <p className="text-gray-600">
                                                                {new Date(tx.transaction_date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {tx.type === 'deposit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                                {(!savings.savings_transactions || savings.savings_transactions.length === 0) && (
                                                    <div className="text-center py-2">
                                                        <p className="text-xs text-gray-500">No transactions yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info Box */}
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <p className="text-xs text-amber-800 leading-relaxed">
                                                To add or withdraw funds, close this dialog and click "Add Funds" on the goal card.
                                            </p>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                                                <p className="text-xs text-gray-600">Target</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    ${parseFloat(savings.target_amount).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                                                <p className="text-xs text-gray-600">Remaining</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    ${(parseFloat(savings.target_amount) - parseFloat(savings.saved_amount)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm 
                                                font-medium hover:bg-gray-50 transition-colors duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !formData.goalName || !formData.targetAmount}
                                        className="flex-1 px-3 py-2 rounded-lg bg-button text-white text-sm font-medium 
                                                hover:bg-hover-button transition-colors duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                                flex items-center justify-center gap-1.5"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <PiggyBank className="w-3.5 h-3.5" />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}