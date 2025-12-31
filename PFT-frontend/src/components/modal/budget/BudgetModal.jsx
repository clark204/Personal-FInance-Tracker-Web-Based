import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Target, DollarSign, Wallet, Calendar, Clock, CalendarDays, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Category from "../../common/CategoryDropdown";
import { useAccount } from "../../../hooks/account";
import { useBudget } from "../../../hooks/budget";

export default function BudgetModal({ isOpen, onClose }) {
    const { createBudget } = useBudget();
    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];

    const modalRef = useRef(null);

    const [formData, setFormData] = useState({
        account_id: "",
        category_id: "",
        period: "",
        start_date: "",
        end_date: "",
        budget_amount: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFormValid =
        formData.account_id &&
        formData.category_id &&
        formData.budget_amount &&
        Number(formData.budget_amount) > 0 &&
        formData.period &&
        (formData.period !== "custom" ||
            (formData.start_date && formData.end_date));

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        
        const budgetData = {
            account_id: Number(formData.account_id),
            category_id: Number(formData.category_id),
            period_type: formData.period,
            start_date: formData.period === "custom" ? formData.start_date : null,
            end_date: formData.period === "custom" ? formData.end_date : null,
            budget_amount: Number(formData.budget_amount),
        };

        try {
            await createBudget.mutateAsync(budgetData);
            setFormData({
                account_id: "",
                category_id: "",
                budget_amount: "",
                period: "",
                start_date: "",
                end_date: "",
            });
            onClose();
        } catch (error) {
            console.error("Failed to create budget:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, isFormValid, isSubmitting, createBudget, onClose]);

    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;
        
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isSubmitting, onClose]);

    // Handle initial focus
    useEffect(() => {
        if (isOpen && modalRef.current) {
            setTimeout(() => {
                const firstInput = modalRef.current.querySelector("input, select, button");
                firstInput?.focus();
            }, 100);
        }
    }, [isOpen]);

    const periodOptions = [
        { value: "week", label: "Weekly", icon: Clock, color: "text-blue-500" },
        { value: "month", label: "Monthly", icon: Calendar, color: "text-emerald-500" },
        { value: "year", label: "Yearly", icon: CalendarDays, color: "text-purple-500" },
        { value: "custom", label: "Custom", icon: Calendar, color: "text-amber-500" }
    ];

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
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="budget-title"
                            aria-describedby="budget-desc"
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
                            <div className="bg-gradient-to-r from-primary-gradient to-secondary-gradient border-b border-border/30 p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white rounded-md border border-gray-200">
                                            <Target className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 id="budget-title" className="text-base font-semibold text-text">
                                                New Budget
                                            </h2>
                                            <p id="budget-desc" className="text-xs text-text-secondary">
                                                Set spending limits
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
                                {/* Account Selection */}
                                <div>
                                    <label htmlFor="account_id" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Account *
                                    </label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <select
                                            id="account_id"
                                            name="account_id"
                                            value={formData.account_id}
                                            onChange={handleChange}
                                            disabled={isSubmitting || accounts.length === 0}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 bg-white 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        >
                                            <option value="">{accounts.length === 0 ? "No accounts" : "Select account"}</option>
                                            {accounts.map((account) => (
                                                <option key={account.id} value={account.id}>
                                                    {account.account_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Category *
                                    </label>
                                    <Category
                                        selectedId={formData.category_id}
                                        onSelect={(val) => setFormData(prev => ({ ...prev, category_id: val }))}
                                        disabled={isSubmitting}
                                        size="small"
                                        aria-label="Budget category selector"
                                    />
                                </div>

                                {/* Budget Amount */}
                                <div>
                                    <label htmlFor="budget_amount" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Budget Amount *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            id="budget_amount"
                                            name="budget_amount"
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.budget_amount}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            min="0.01"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Period */}
                                <div>
                                    <label htmlFor="period" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Period *
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <select
                                            id="period"
                                            name="period"
                                            value={formData.period}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        >
                                            <option value="">Select period</option>
                                            {periodOptions.map((period) => (
                                                <option key={period.value} value={period.value}>
                                                    {period.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Custom Date Range */}
                                {formData.period === "custom" && (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                            <span className="text-xs font-medium text-gray-700">Custom Date Range</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label htmlFor="start_date" className="text-xs font-medium text-gray-600 mb-1 block">
                                                    Start Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    id="start_date"
                                                    name="start_date"
                                                    value={formData.start_date}
                                                    onChange={handleChange}
                                                    disabled={isSubmitting}
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 
                                                             focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="end_date" className="text-xs font-medium text-gray-600 mb-1 block">
                                                    End Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    id="end_date"
                                                    name="end_date"
                                                    value={formData.end_date}
                                                    onChange={handleChange}
                                                    disabled={isSubmitting}
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 
                                                             focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Compact Buttons */}
                                <div className="flex gap-2 pt-3">
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
                                        disabled={!isFormValid || isSubmitting}
                                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                                                 bg-button hover:bg-hover-button text-white
                                                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                                 flex items-center justify-center gap-1.5"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Target className="w-3.5 h-3.5" />
                                                <span>Create Budget</span>
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