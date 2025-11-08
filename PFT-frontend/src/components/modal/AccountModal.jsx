import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import Currency from "../common/currency";
import { useAccount } from "../../hooks/account";

export default function AccountModal({ isOpen, onClose }) {
    const { createAccount } = useAccount();

    const [formData, setFormData] = useState({
        accountName: "",
        type: "Cash",
        currency: "",
        balance: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const accountData = {
            account_name: formData.accountName,
            type: formData.type,
            currency_id: parseInt(formData.currency),
            balance: parseFloat(formData.balance)
        }

        console.log(accountData);
        createAccount.mutate(accountData, {
            onSuccess: () => {
                onClose();
            },
            onError: (err) => {
                console.error("Error creating account:", err);
            },
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
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
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-3 mb-5">
                            <div>
                                <h2 className="text-lg font-semibold text-text">
                                    Create New Account
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Set up your account and choose its currency
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5 text-text" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Account Name */}
                            <div>
                                <label className="block text-sm font-medium text-text/70">
                                    Account Name
                                </label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    placeholder="e.g., Main Wallet"
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-text/70">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            {/* Currency Dropdown */}
                            <Currency
                                value={formData.currency}
                                onChange={(val) =>
                                    setFormData((prev) => ({ ...prev, currency: val }))
                                }
                            />

                            {/* Initial Balance */}
                            <div>
                                <label className="block text-sm font-medium text-text/70">
                                    Initial Balance
                                </label>
                                <input
                                    type="number"
                                    name="balance"
                                    value={formData.balance}
                                    onChange={handleChange}
                                    placeholder="e.g., 1000.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-button text-white font-medium hover:bg-hover-button transition"
                                >
                                    {createAccount.isPending ? "Creating..." : "Create Account"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
