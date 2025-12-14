import { AnimatePresence, motion } from "framer-motion";
import { useTransaction } from "../../hooks/transaction";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "../../hooks/account";
import Category from "../common/CategoryDropdown";
import { Bounce, toast } from "react-toastify";

export default function EditTransactionModal({ isOpen, onClose, transactionID }) {
    const { showTransaction, updateTransaction } = useTransaction(transactionID);
    const { getAccounts } = useAccount();

    const accounts = getAccounts.data?.account || [];
    const details = showTransaction.data || [];

    const [formData, setFormData] = useState({
        type: details.type || "",
        amount: details.amount || "",
        category_id: details.category_id || "",
        account_id: details.account_id || "",
        description: details.description || ""
    });

    useEffect(() => {
        if (details) {
            setFormData({
                type: details.type,
                amount: details.amount,
                category_id: details.category_id,
                account_id: details.account_id,
                description: details.description
            });
        }
    }, [details]);

    const isFormValid =
        formData.type &&
        formData.amount &&
        Number(formData.amount) > 0 &&
        formData.category_id &&
        formData.account_id;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const updateTransactionData = {
            account_id: Number(formData.account_id) || null,
            category_id: Number(formData.category_id) || null,
            type: formData.type,
            amount: Number(formData.amount) || 0,
            description: formData.description,
        }
        updateTransaction.mutate({ ...updateTransactionData, id: transactionID }, {
            onSuccess: (res) => {
                if (!res.success) {
                    toast.error(`Update failed: ${res.message}`, {
                        position: "bottom-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        progress: undefined,
                        theme: "light",
                        transition: Bounce,
                    });
                    return;
                }
                onClose();
            },

        })
    }


    if (!isOpen || transactionID == null || showTransaction.isLoading) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
                >
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Edit Transaction
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-text" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} method="POST" className="space-y-4">
                        <div>
                            <label htmlFor="type" className="label-style">
                                Type *
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                autoComplete="transaction-type"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                            >
                                <option value="">Select type</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="account_id" className="label-style">
                                Account *
                            </label>
                            <select
                                id="account_id"
                                name="account_id"
                                value={formData.account_id}
                                onChange={handleChange}
                                autoComplete="transaction-account"
                                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                            >
                                <option value="">Select account</option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="amount" className="label-style">
                                Amount *
                            </label>
                            <input
                                id="amount"
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                autoComplete="transaction-amount"
                                placeholder="0.00"
                                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="category_id" className="label-style">
                                Category *
                            </label>

                            {/* Hidden, but linked input to satisfy accessibility */}
                            <input
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                readOnly
                                hidden
                            />

                            <Category
                                selectedId={formData.category_id}
                                onSelect={(val) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        category_id: val,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="label-style">
                                Description
                            </label>
                            <input
                                id="description"
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                autoComplete="transaction-description"
                                placeholder="Enter description"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary/50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isFormValid}
                                className="px-4 py-2 rounded-lg border border-border bg-button text-white font-medium hover:bg-hover-button transition cursor-pointer"
                            >
                                Update Transaction
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}