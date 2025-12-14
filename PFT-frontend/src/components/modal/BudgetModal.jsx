import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Category from "../common/CategoryDropdown";
import { useAccount } from "../../hooks/account";
import { useBudget } from "../../hooks/budget";

export default function BudgetModal({ isOpen, onClose }) {
    const { createBudget } = useBudget();
    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];

    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    const [formData, setFormData] = useState({
        account_id: "",
        category_id: "",
        period: "",
        start_date: "",
        end_date: "",
        budget_amount: "",
    });

    const isFormValid =
        formData.account_id &&
        formData.category_id &&
        formData.budget_amount &&
        formData.period &&
        (formData.period !== "custom" ||
            (formData.start_date && formData.end_date));

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const budgetData = {
            account_id: Number(formData.account_id) || null,
            category_id: Number(formData.category_id) || null,
            period_type: formData.period,
            start_date: formData.period === "custom" ? formData.start_date : null,
            end_date: formData.period === "custom" ? formData.end_date : null,
            budget_amount: Number(formData.budget_amount) || 0,
        };

        createBudget.mutate(budgetData, {
            onSuccess: () => {
                setFormData({
                    account_id: "",
                    category_id: "",
                    budget_amount: "",
                    period: "",
                    start_date: "",
                    end_date: "",
                });
                onClose();
            },
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="budget-title"
                    aria-describedby="budget-desc"
                    className="fixed inset-0 z-50 flex items-center justify-center blur-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={modalRef}
                        tabIndex="-1"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 outline-none"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-3 mb-5">
                            <div>
                                <h2 id="budget-title" className="text-lg font-semibold text-text">
                                    Create New Budget
                                </h2>
                                <p id="budget-desc" className="text-sm text-text-secondary">
                                    Set spending limits for specific categories
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                aria-label="Close budget modal"
                                className="p-2 rounded-full hover:bg-text-secondary/50 transition"
                            >
                                <X className="w-5 h-5 text-text" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Account */}
                            <div>
                                <label htmlFor="account_id" className="label-style">
                                    Account *
                                </label>
                                <select
                                    id="account_id"
                                    name="account_id"
                                    value={formData.account_id}
                                    onChange={handleChange}
                                    required
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

                            {/* Category */}
                            <div>
                                <label htmlFor="category_input" className="label-style">
                                    Category *
                                </label>

                                {/* Hidden input to satisfy accessibility rules */}
                                <input
                                    id="category_input"
                                    name="category_id"
                                    value={formData.category_id}
                                    readOnly
                                    className="sr-only"
                                />

                                <Category
                                    aria-labelledby="category_input"
                                    selectedId={formData.category_id}
                                    onSelect={(val) =>
                                        setFormData((prev) => ({ ...prev, category_id: val }))
                                    }
                                />
                            </div>

                            {/* Budget Amount */}
                            <div>
                                <label htmlFor="budget_amount" className="label-style">
                                    Budget Amount
                                </label>
                                <input
                                    id="budget_amount"
                                    name="budget_amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.budget_amount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>

                            {/* Period */}
                            <div>
                                <label htmlFor="period" className="label-style">
                                    Period
                                </label>
                                <select
                                    id="period"
                                    name="period"
                                    value={formData.period}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                >
                                    <option value="">Select period</option>
                                    <option value="week">Week</option>
                                    <option value="month">Month</option>
                                    <option value="year">Year</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            {/* Custom Date Range */}
                            {formData.period === "custom" && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="start_date" className="label-style">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="start_date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="end_date" className="label-style">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="end_date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Cancel budget creation"
                                    className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary/50 transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    aria-label="Add new budget"
                                    disabled={!isFormValid}
                                    className="px-4 py-2 rounded-lg border border-border bg-button text-white font-medium hover:bg-hover-button transition"
                                >
                                    Add Budget
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
