import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Target, DollarSign, Calendar, Wallet, TrendingUp, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AccountDropdown from "../../common/AccountDropdown";
import { useSavings } from "../../../hooks/savings";

export default function GoalModal({ isOpen, onClose }) {
    const { createSavings } = useSavings();
    const modalRef = useRef(null);

    const [formData, setFormData] = useState({
        account_id: "",
        savings_name: "",
        saved_amount: "",
        target_amount: "",
        deadline: "",
        description: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFormValid = 
        formData.account_id && 
        formData.savings_name && 
        formData.target_amount && 
        Number(formData.target_amount) > 0;

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        
        const goalData = {
            account_id: Number(formData.account_id),
            savings_name: formData.savings_name.trim(),
            saved_amount: Number(formData.saved_amount) || 0,
            target_amount: Number(formData.target_amount),
            deadline: formData.deadline || null,
            description: formData.description.trim() || null,
        };

        try {
            await createSavings.mutateAsync(goalData);
            setFormData({
                account_id: "",
                savings_name: "",
                saved_amount: "",
                target_amount: "",
                deadline: "",
                description: "",
            });
            onClose();
        } catch (error) {
            console.error("Failed to create savings goal:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, isFormValid, isSubmitting, createSavings, onClose]);

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
                            aria-labelledby="goal-title"
                            aria-describedby="goal-desc"
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
                                            <h2 id="goal-title" className="text-base font-semibold text-text">
                                                New Savings Goal
                                            </h2>
                                            <p id="goal-desc" className="text-xs text-text-secondary">
                                                Set target and deadline
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
                                {/* Account */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Account *
                                    </label>
                                    <AccountDropdown
                                        selectedId={formData.account_id}
                                        onSelect={(val) => setFormData(prev => ({ ...prev, account_id: val }))}
                                        disabled={isSubmitting}
                                        size="small"
                                        aria-label="Select account for savings goal"
                                    />
                                </div>

                                {/* Goal Name */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Goal Name *
                                    </label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="savings_name"
                                            placeholder="e.g., Vacation Fund"
                                            value={formData.savings_name}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Saved Amount */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Already Saved
                                    </label>
                                    <div className="relative">
                                        <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="number"
                                            name="saved_amount"
                                            placeholder="0.00"
                                            value={formData.saved_amount}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            min="0"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Target Amount */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Target Amount *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="number"
                                            name="target_amount"
                                            placeholder="0.00"
                                            value={formData.target_amount}
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

                                {/* Deadline */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Deadline
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Description (optional)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="description"
                                            placeholder="e.g., Travel, Emergency, Technology"
                                            value={formData.description}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

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
                                                <span>Create Goal</span>
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