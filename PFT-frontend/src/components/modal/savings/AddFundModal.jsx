import { AnimatePresence, motion } from "framer-motion";
import { X, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useCallback } from "react";
import { useSavings } from "../../../hooks/savings";

export default function AddFundModal({ isOpen, onClose, savingsID, fundsType }) {
    const { createSavingsTransaction } = useSavings(savingsID);
    const [amount, setAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ensure type matches backend expectations
    const backendType = fundsType === 'withdraw' ? 'withdrawal' : fundsType;
    const isDeposit = backendType === 'deposit';
    const title = isDeposit ? "Add Funds" : "Withdraw Funds";
    const description = isDeposit 
        ? "Set a contribution amount for your savings goal" 
        : "Access your saved funds for other uses";
    const buttonText = isDeposit ? "Add Funds" : "Withdraw";
    const Icon = isDeposit ? TrendingUp : TrendingDown;

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0 || isSubmitting) return;

        setIsSubmitting(true);
        
        const transactionData = {
            savings_id: savingsID,
            type: backendType, // Use the mapped type
            amount: parseFloat(amount),
            transaction_date: new Date().toISOString().split('T')[0],
        };

        try {
            await createSavingsTransaction.mutateAsync(transactionData);
            setAmount("");
            onClose();
        } catch (error) {
            console.error(`Failed to ${backendType}:`, error);
        } finally {
            setIsSubmitting(false);
        }
    }, [amount, savingsID, backendType, createSavingsTransaction, onClose, isSubmitting]);

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

                    {/* Modal - Compact size */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ 
                                type: "tween",
                                duration: 0.2,
                                ease: "easeOut"
                            }}
                            className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 pointer-events-auto"
                        >
                            {/* Compact Header */}
                            <div className={`border-b border-border/30 p-4 ${
                                isDeposit 
                                    ? 'bg-gradient-to-r from-emerald-50 to-blue-50' 
                                    : 'bg-gradient-to-r from-rose-50 to-amber-50'
                            }`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 bg-white rounded-md border ${
                                            isDeposit ? 'border-emerald-200' : 'border-rose-200'
                                        }`}>
                                            <Icon className={`w-4 h-4 ${
                                                isDeposit ? 'text-emerald-600' : 'text-rose-600'
                                            }`} />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-text">
                                                {title}
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                {description}
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

                            {/* Compact Form */}
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                {/* Amount Input */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        {isDeposit ? 'Contribution' : 'Withdraw'} Amount *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="number"
                                            name="amount"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            disabled={isSubmitting}
                                            min="0.01"
                                            step="0.01"
                                            className={`w-full border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:ring-1 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed
                                                     ${isDeposit 
                                                        ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100' 
                                                        : 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                                                     }`}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Info Message */}
                                <div className={`text-xs p-2.5 rounded-lg border ${
                                    isDeposit
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                    {isDeposit
                                        ? "Funds will be added to your savings goal balance"
                                        : "Funds will be withdrawn from your savings goal balance"
                                    }
                                </div>

                                {/* Compact Buttons */}
                                <div className="flex gap-2 pt-1">
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
                                        type="submit"
                                        disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                                                 ${isDeposit 
                                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                                    : 'bg-rose-500 hover:bg-rose-600 text-white'
                                                 }
                                                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                                 flex items-center justify-center gap-1.5`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Icon className="w-3.5 h-3.5" />
                                                <span>{buttonText}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}