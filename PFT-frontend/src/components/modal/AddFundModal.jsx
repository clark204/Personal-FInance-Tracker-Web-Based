import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useSavings } from "../../hooks/savings";

export default function AddFundModal({ isOpen, onClose, savingsID, fundsType }) {
    const { showSaving, createSavingsTransaction } = useSavings(savingsID);
    const [amount, setAmount] = useState("");

    const handleSubmitDeposit = (e) => {
        e.preventDefault();
        const transactionData = {
            savings_id: savingsID,
            type: 'deposit',
            amount: parseFloat(amount),
            transaction_date: new Date().toISOString().split('T')[0],
        };
        createSavingsTransaction.mutate(transactionData, {
            onSuccess: () => {
                setAmount("");
                onClose();
            }
        });
    };

    const handleSubmitWithdraw = (e) => {
        e.preventDefault();
        const transactionData = {
            savings_id: savingsID,
            type: 'withdrawal',
            amount: parseFloat(amount),
            transaction_date: new Date().toISOString().split('T')[0],
        };
        createSavingsTransaction.mutate(transactionData, {
            onSuccess: () => {
                setAmount("");
                onClose();
            }
        });
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center blur-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
                    >

                        {fundsType === 'deposit' && (
                            <>
                                {/* Header */}
                                <div className="flex justify-between items-start border-b pb-3 mb-5">
                                    <div>
                                        <h2 className="text-lg font-semibold text-text">Add Funds</h2>
                                        <p className="text-sm text-text-secondary">
                                            Set a contribution amount for your savings goal.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-text-secondary/50 transition"
                                    >
                                        <X className="w-5 h-5 text-text" />
                                    </button>
                                </div>
                                <form method="POST" onSubmit={handleSubmitDeposit}>
                                    <div>
                                        <label className="label-style">
                                            Contribution Amount <span className="text-expense">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="saved_amount"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary/50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-border rounded-lg bg-button text-white font-medium hover:bg-hover-button transition"
                                        >
                                            Add Saved Amount
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                        {fundsType === 'withdraw' && (
                            <>
                                {/* Header */}
                                <div className="flex justify-between items-start border-b pb-3 mb-5">
                                    <div>
                                        <h2 className="text-lg font-semibold text-text">Withdraw Funds</h2>
                                        <p className="text-sm text-text-secondary">
                                            Access your saved funds for other uses.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-text-secondary/50 transition"
                                    >
                                        <X className="w-5 h-5 text-text" />
                                    </button>
                                </div>
                                <form method="POST" onSubmit={handleSubmitWithdraw}>
                                    <div>
                                        <label className="label-style">
                                            Withdraw Amount <span className="text-expense">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="saved_amount"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                            required
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary/50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-border rounded-lg bg-button text-white font-medium hover:bg-hover-button transition"
                                        >
                                            Withdraw
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
