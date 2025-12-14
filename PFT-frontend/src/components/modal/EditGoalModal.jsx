import { AnimatePresence, motion } from "framer-motion";
import { X, Calendar, PiggyBank } from "lucide-react";
import { useState, useEffect } from "react";
import { useSavings } from "../../hooks/savings";

export default function EditGoalModal({ isOpen, onClose, ID }) {
    const { showSaving, updateSaving } = useSavings(ID);
    const savings = showSaving.data?.data || null;    

    const account = showSaving.data?.account || null;
    
    // Initialize form state
    const [formData, setFormData] = useState({
        goalName: "",
        targetAmount: "",
        deadline: "",
        description: ""
    });

    // Update form when savings data loads
    useEffect(() => {
        if (savings) {
            // Format the deadline for date input (YYYY-MM-DD)
            let formattedDeadline = "";
            if (savings.deadline) {
                const date = new Date(savings.deadline);
                // Convert to YYYY-MM-DD format for date input
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

    // Calculate actual progress from savings data
    const progress = savings && parseFloat(savings.target_amount) > 0
        ? (parseFloat(savings.saved_amount) / parseFloat(savings.target_amount)) * 100
        : 0;

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            savings_name: formData.goalName,
            target_amount: parseFloat(formData.targetAmount),
            deadline: formData.deadline || null,
            description: formData.description || null,
        };
        updateSaving.mutate(updatedData, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    if (!ID) return null;
    // Show loading state
    if (showSaving.isLoading) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading savings data...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Don't render if no savings data
    if (!savings) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start p-6 border-b">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Edit Savings Goal</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Update your savings goal details
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row">
                            {/* Left Panel - Form */}
                            <div className="w-full md:w-1/2 p-6">
                                <div className="space-y-6">
                                    {/* Goal Name */}
                                    <div>
                                        <label className="label-style">
                                            Goal Name
                                        </label>
                                        <input
                                            type="text"
                                            name="goalName"
                                            value={formData.goalName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-focus outline-none transition"
                                        />
                                    </div>

                                    {/* Target Amount */}
                                    <div>
                                        <label className="label-style">
                                            Target Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                type="number"
                                                name="targetAmount"
                                                value={formData.targetAmount}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-focus outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div>
                                        <label className="label-style">
                                            Deadline
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                name="deadline"
                                                value={formData.deadline}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 px-3 py-2 border border-border rounded-xl focus:ring-2 focus:ring-focus outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="label-style">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-focus outline-none transition resize-none"
                                            rows="3"
                                            placeholder="Add a description for your savings goal..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel - Stats & Info */}
                            <div className="w-full md:w-1/2 p-6 border-l border-gray-200">
                                <div className="space-y-6">
                                    {/* Current Balance Card */}
                                    <div className="bg-linear-to-r from-main-light to-main rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Current Balance</h3>
                                                <p className="text-3xl font-bold text-income mt-2">
                                                    ${parseFloat(savings.saved_amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })}
                                                </p>
                                            </div>
                                            <PiggyBank className="w-12 h-12 text-blue-500" />
                                        </div>
                                        <div className="mb-2">
                                            <div className="flex justify-between text-sm text-white mb-1">
                                                <span>Progress</span>
                                                <span>{progress.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-linear-to-r from-main-light to-income h-3 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-white text-center mt-3">
                                            ${parseFloat(savings.saved_amount).toLocaleString()} of ${parseFloat(savings.target_amount).toLocaleString()} target
                                        </p>
                                    </div>

                                    {/* Transaction History */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                                        <div className="space-y-4 max-h-48 overflow-y-auto">
                                            {/* Display actual transactions if they exist */}
                                            {savings.savings_transactions && savings.savings_transactions.length > 0 ? (
                                                savings.savings_transactions.map((transaction, index) => (
                                                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                        <div>
                                                            <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
                                                                    month: '2-digit',
                                                                    day: '2-digit',
                                                                    year: 'numeric'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`font-bold ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {transaction.type === 'deposit' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <>
                                                    {/* No transactions yet */}
                                                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl">
                                                        <div>
                                                            <p className="font-medium text-text">Contributions</p>
                                                            <p className="text-sm text-text-secondary">No contributions yet</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-income">$0</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-gray-100 rounded-xl">
                                                        <div>
                                                            <p className="font-medium text-text">Withdrawals</p>
                                                            <p className="text-sm text-text-secondary">No withdrawals yet</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-expense">$0</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                        <p className="text-sm text-yellow-800">
                                            To add or withdraw funds, close this dialog and click "Add Funds" on the goal card.
                                        </p>
                                    </div>

                                    {/* Account Info */}
                                    <div className="text-center p-4 border border-gray-200 rounded-xl">
                                        <p className="text-gray-900 font-medium">Linked Account</p>
                                        <p className="text-xl font-bold text-main-light">{account.account_name || 'No Account'}</p>
                                        <p className="text-sm text-text mt-1">
                                            {account.type || ''} • Balance: {account.currency?.symbol}{parseFloat(account.balance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end gap-4 p-6 border-t border-text-secondary">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                type="button"
                                className="px-4 py-2 rounded-lg bg-button text-white font-medium hover:bg-hover-button transition cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}