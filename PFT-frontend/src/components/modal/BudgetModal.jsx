import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BudgetModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        category: "",
        limit: "",
        period: "Monthly",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("New Budget:", form);
        onClose();
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
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Create New Budget
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Set spending limits for specific categories
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                >
                                    <option value="">Select category</option>
                                    <option value="Food & Dining">Food & Dining</option>
                                    <option value="Transportation">Transportation</option>
                                    <option value="Entertainment">Entertainment</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            {/* Budget Limit */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Budget Limit
                                </label>
                                <input
                                    type="number"
                                    name="limit"
                                    placeholder="0.00"
                                    value={form.limit}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>

                            {/* Period */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Period
                                </label>
                                <select
                                    name="period"
                                    value={form.period}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition"
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
