import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransaction } from "../../hooks/transaction";
import CategoryDropdown from "../common/CategoryDropdown";
import { useAccount } from "../../hooks/account";

export default function TransactionModal({ isOpen, onClose }) {
    const { createTransaction } = useTransaction();
    const { getAccounts } = useAccount();
    const modalRef = useRef(null);

    const accounts = getAccounts?.data?.account || [];

    const [form, setForm] = useState({
        type: "",
        description: "",
        amount: "",
        category_id: "",
        account_id: "",
    });

    const isFormValid =
        form.type &&
        form.amount &&
        Number(form.amount) > 0 &&
        form.category_id &&
        form.account_id;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const transactionData = {
            account_id: Number(form.account_id) || null,
            category_id: Number(form.category_id) || null,
            type: form.type,
            amount: Number(form.amount) || 0,
            description: form.description,
            date: new Date().toISOString().split("T")[0],
        };

        createTransaction.mutate(transactionData, {
            onSuccess: () => {
                setForm({
                    type: "",
                    description: "",
                    amount: "",
                    category_id: "",
                    account_id: "",
                });
                onClose();
            },
        });
    };

    useEffect(() => {
        if (isOpen && modalRef.current) {
            const el = modalRef.current.querySelector("input, select, button");
            el?.focus();
        }
    }, [isOpen]);

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
                        ref={modalRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="transaction-title"
                        aria-describedby="transaction-desc"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.25 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative"
                    >
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                            <div>
                                <h2 id="transaction-title" className="text-lg font-semibold text-text">
                                    New Transaction
                                </h2>
                                <p id="transaction-desc" className="text-sm text-text-secondary">
                                    Create a new financial transaction.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-text-secondary/50 rounded-full transition"
                                aria-label="Close transaction modal"
                            >
                                <X className="w-5 h-5 text-text" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label htmlFor="type" className="label-style">Type *</label>
                                <select
                                    id="type"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    autoComplete="transaction-type"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                    required
                                >
                                    <option value="">Select type</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="account_id" className="label-style">Account *</label>
                                <select
                                    id="account_id"
                                    name="account_id"
                                    value={form.account_id}
                                    onChange={handleChange}
                                    autoComplete="transaction-account"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                    required
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
                                <label htmlFor="amount" className="label-style">Amount *</label>
                                <input
                                    id="amount"
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    autoComplete="transaction-amount"
                                    placeholder="0.00"
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label-style">Category *</label>
                                <CategoryDropdown
                                    selectedId={form.category_id}
                                    onSelect={(val) =>
                                        setForm((prev) => ({ ...prev, category_id: val }))
                                    }
                                    aria-label="Transaction category selector"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="label-style">Description</label>
                                <input
                                    id="description"
                                    type="text"
                                    name="description"
                                    value={form.description}
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
                                    className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary/50 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={!isFormValid}
                                    className="px-4 py-2 rounded-lg bg-button text-white font-medium hover:bg-hover-button transition"
                                >
                                    Add Transaction
                                </button>
                            </div>

                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
