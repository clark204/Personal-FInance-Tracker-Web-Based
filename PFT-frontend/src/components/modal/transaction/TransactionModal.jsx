import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, ArrowUp, ArrowDown, Wallet, Tag, FileText, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransaction } from "../../../hooks/transaction";
import CategoryDropdown from "../../common/CategoryDropdown";
import { useAccount } from "../../../hooks/account";

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

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFormValid =
        form.type &&
        form.amount &&
        Number(form.amount) > 0 &&
        form.category_id &&
        form.account_id;

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleTypeSelect = useCallback((type) => {
        setForm(prev => ({ ...prev, type }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!isFormValid || isSubmitting) return;

        setIsSubmitting(true);
        
        const transactionData = {
            account_id: Number(form.account_id),
            category_id: Number(form.category_id),
            type: form.type,
            amount: Number(form.amount),
            description: form.description.trim(),
            date: new Date().toISOString().split("T")[0],
        };

        try {
            await createTransaction.mutateAsync(transactionData);
            setForm({
                type: "",
                description: "",
                amount: "",
                category_id: "",
                account_id: "",
            });
            onClose();
        } catch (error) {
            console.error("Failed to create transaction:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [form, isFormValid, isSubmitting, createTransaction, onClose]);

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

    const transactionTypes = [
        { value: "Income", label: "Income", icon: ArrowUp, color: "text-income" },
        { value: "Expense", label: "Expense", icon: ArrowDown, color: "text-expense" }
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
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
                        onClick={isSubmitting ? undefined : onClose}
                    />

                    {/* Modal - Smaller max-width and reduced padding */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            ref={modalRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="transaction-title"
                            aria-describedby="transaction-desc"
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
                                            <Plus className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 id="transaction-title" className="text-base font-semibold text-text">
                                                New Transaction
                                            </h2>
                                            <p id="transaction-desc" className="text-xs text-text-secondary">
                                                Record income or expenses
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
                                {/* Compact Type Selection */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Type *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {transactionTypes.map(({ value, label, icon: Icon, color }) => (
                                            <button
                                                type="button"
                                                key={value}
                                                onClick={() => handleTypeSelect(value)}
                                                disabled={isSubmitting}
                                                className={`p-2.5 rounded-lg border text-sm flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer
                                                    ${form.type === value 
                                                        ? `${value === 'Income' ? 'border-income bg-income/5 text-income' : 'border-expense bg-expense/5 text-expense'}`
                                                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'}`}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                                <span>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

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
                                            value={form.account_id}
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

                                {/* Amount */}
                                <div>
                                    <label htmlFor="amount" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Amount *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            id="amount"
                                            type="number"
                                            name="amount"
                                            value={form.amount}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            placeholder="0.00"
                                            min="0.01"
                                            step="0.01"
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Category *
                                    </label>
                                    <CategoryDropdown
                                        selectedId={form.category_id}
                                        onSelect={(val) => setForm(prev => ({ ...prev, category_id: val }))}
                                        disabled={isSubmitting}
                                        size="small"
                                        aria-label="Transaction category selector"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Description (optional)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            id="description"
                                            type="text"
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            disabled={isSubmitting}
                                            placeholder="Enter description"
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
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                                                 ${form.type === 'Income' 
                                                    ? 'bg-income hover:bg-income/90 text-white' 
                                                    : form.type === 'Expense'
                                                    ? 'bg-expense hover:bg-expense/90 text-white'
                                                    : 'bg-button hover:bg-hover-button text-white'}
                                                 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                                 flex items-center justify-center gap-1.5`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Adding...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add</span>
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