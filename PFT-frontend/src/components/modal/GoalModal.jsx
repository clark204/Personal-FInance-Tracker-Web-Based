import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSavings } from "../../hooks/savings";
import AccountDropdown from "../common/AccountDropdown";

export default function GoalModal({ isOpen, onClose }) {
    const { createSavings } = useSavings();

    const [formData, setFormData] = useState({
        account_id: "",
        savings_name: "",
        saved_amount: "",
        target_amount: "",
        deadline: "",
        description: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const goalData = {
            account_id: Number(formData.account_id),
            savings_name: formData.savings_name,
            saved_amount: Number(formData.saved_amount) || 0,
            target_amount: Number(formData.target_amount),
            deadline: formData.deadline,
            description: formData.description || null,
        }
        createSavings.mutate(goalData, {
            onSuccess: () => {
                setFormData({
                    account_id: "",
                    savings_name: "",
                    saved_amount: "",
                    target_amount: "",
                    deadline: "",
                    description: "",
                });
                onClose();
            },
        });
    };

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
                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-3 mb-5">
                            <div>
                                <h2 className="text-lg font-semibold text-text">
                                    Create New Savings Goal
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Set a target and deadline for your savings goal
                                </p>
                            </div>
                            <button
                                onClick={onClose}
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
                                <AccountDropdown
                                    selectedId={formData.account_id}
                                    onSelect={(val) =>
                                        setFormData((prev) => ({ ...prev, account_id: val }))
                                    }
                                />
                            </div>

                            {/* Goal Name */}
                            <div>
                                <label className="label-style">
                                    Goal Name <span className="text-expense">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="savings_name"
                                    placeholder="e.g., Vacation Fund"
                                    value={formData.savings_name}
                                    onChange={handleChange}
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>

                            {/* Saved Amount */}
                            <div>
                                <label className="label-style">
                                    Saved Already
                                </label>
                                <input
                                    type="number"
                                    name="saved_amount"
                                    placeholder="0.00"
                                    value={formData.saved_amount}
                                    onChange={handleChange}
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>

                            {/* Target Amount */}
                            <div>
                                <label className="label-style">
                                    Target Amount <span className="text-expense">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="target_amount"
                                    placeholder="0.00"
                                    value={formData.target_amount}
                                    onChange={handleChange}
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="label-style">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="label-style">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="e.g., Travel, Technology, Emergency"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
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
                                    Create Goal
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
