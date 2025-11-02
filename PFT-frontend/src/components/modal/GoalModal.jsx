import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GoalModal({ isOpen, onClose }) {
    const [form, setForm] = useState({
        goalName: "",
        targetAmount: "",
        deadline: "",
        category: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("New goal:", form);
        onClose();
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
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Create New Savings Goal
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Set a target and deadline for your savings goal
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
                            {/* Goal Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Goal Name
                                </label>
                                <input
                                    type="text"
                                    name="goalName"
                                    placeholder="e.g., Vacation Fund"
                                    value={form.goalName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>

                            {/* Target Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Amount
                                </label>
                                <input
                                    type="number"
                                    name="targetAmount"
                                    placeholder="0.00"
                                    value={form.targetAmount}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>

                            {/* Deadline */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={form.deadline}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    placeholder="e.g., Travel, Technology, Emergency"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-400 outline-none"
                                />
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
                                    className="px-4 py-2 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
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
