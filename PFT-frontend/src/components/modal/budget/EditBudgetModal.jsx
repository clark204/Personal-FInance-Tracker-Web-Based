import { AnimatePresence, motion } from "framer-motion";
import { X, Target, DollarSign, Wallet, Calendar, Clock, CalendarDays, CreditCard, Landmark, PiggyBank } from "lucide-react";
import { useBudget } from "../../../hooks/budget";
import { useEffect, useState, useCallback } from "react";

export default function EditBudgetModal({ isOpen, onClose, budgetID }) {
    const { showBudget, updateBudget } = useBudget(budgetID);
    const details = showBudget.data;
    console.log("budget data:", details);

    const [formData, setFormData] = useState({
        budget_amount: "",
        start_date: "",
        end_date: "",
        period: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFormValid =
        formData.budget_amount &&
        parseFloat(formData.budget_amount) > 0 &&
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
        
        const updateData = {
            id: budgetID,
            budget_amount: parseFloat(formData.budget_amount),
            period_type: formData.period,
            start_date: formData.period === "custom" ? formData.start_date : null,
            end_date: formData.period === "custom" ? formData.end_date : null,
        };

        try {
            await updateBudget.mutateAsync(updateData);
            onClose();
        } catch (error) {
            console.error("Failed to update budget:", error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, budgetID, isFormValid, isSubmitting, updateBudget, onClose]);

    useEffect(() => {
        if (details) {
            setFormData({
                budget_amount: details.budget_amount || "",
                start_date: details.start_date || "",
                end_date: details.end_date || "",
                period: details.period_type || ""
            });
        }
    }, [details]);

    const periodOptions = [
        { value: "week", label: "Weekly", icon: Clock },
        { value: "month", label: "Monthly", icon: Calendar },
        { value: "year", label: "Yearly", icon: CalendarDays },
        { value: "custom", label: "Custom", icon: Calendar }
    ];

    const getAccountIcon = (accountType) => {
        switch(accountType?.toLowerCase()) {
            case 'cash': return Wallet;
            case 'credit card': return CreditCard;
            case 'bank': return Landmark;
            case 'savings': return PiggyBank;
            default: return Wallet;
        }
    };

    const getCategoryType = (category) => {
        if (!category) return "General";
        
        // If parent_id is null, it's a parent category (general)
        if (category.parent_id === null) {
            return "General";
        }
        
        // If it has a parent object, show parent name
        if (category.parent) {
            return `Child of ${category.parent.category_name}`;
        }
        
        return "General";
    };

    if (!isOpen || budgetID == null) return null;

    const isLoading = showBudget?.isLoading;
    const AccountIcon = details?.account?.type ? getAccountIcon(details.account.type) : Wallet;
    const categoryType = getCategoryType(details?.category);

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
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
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
                                            <h2 className="text-base font-semibold text-text">
                                                Edit Budget
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                Update your budget details
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

                            {/* Content */}
                            <div className="p-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-3 text-sm text-gray-600">Loading budget data...</p>
                                    </div>
                                ) : details ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Account Display (Read-only) */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                Account
                                            </label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="p-2 bg-white rounded-lg border border-gray-300">
                                                    <AccountIcon className="w-4 h-4 text-gray-700" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {details.account?.account_name || "Unknown Account"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-600">
                                                            {details.account?.type || "Unknown Type"}
                                                        </span>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-xs font-medium text-green-600">
                                                            Balance: ${details.account?.balance || "0.00"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Account cannot be changed for an existing budget
                                            </p>
                                        </div>

                                        {/* Category Display (Read-only) */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
                                                Category
                                            </label>
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                                                    <span className="text-sm font-semibold text-blue-700">
                                                        {details.category?.category_name?.charAt(0) || "C"}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {details.category?.category_name || "Unknown Category"}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                                            {categoryType}
                                                        </span>
                                                        {details.budget_spent && (
                                                            <>
                                                                <span className="text-gray-400">•</span>
                                                                <span className={`text-xs font-medium ${parseFloat(details.budget_spent) > parseFloat(details.budget_amount) ? 'text-red-600' : 'text-green-600'}`}>
                                                                    Spent: ${details.budget_spent}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Category cannot be changed for an existing budget
                                            </p>
                                        </div>

                                        {/* Budget Amount */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
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
                                                    required
                                                    min="0.01"
                                                    step="0.01"
                                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                             focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                            {details.budget_spent && (
                                                <div className="mt-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-600">Spent: ${details.budget_spent}</span>
                                                        <span className="text-gray-600">Remaining: ${(parseFloat(formData.budget_amount || details.budget_amount) - parseFloat(details.budget_spent)).toFixed(2)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                        <div 
                                                            className={`h-1.5 rounded-full ${parseFloat(details.budget_spent) > parseFloat(details.budget_amount) ? 'bg-red-500' : 'bg-blue-500'}`}
                                                            style={{ 
                                                                width: `${Math.min(100, (parseFloat(details.budget_spent) / parseFloat(formData.budget_amount || details.budget_amount)) * 100)}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Period */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-1 block">
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
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                             focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="">Select period</option>
                                                    {periodOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            {formData.period && (
                                                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                                                        <span className="text-xs font-medium text-blue-700">
                                                            Current: {details.start_date} to {details.end_date}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
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
                                                            min={formData.start_date}
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
                                                className="flex-1 px-3 py-2 rounded-lg bg-button text-white text-sm font-medium 
                                                         hover:bg-hover-button transition-colors duration-150
                                                         disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                                         flex items-center justify-center gap-1.5"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        <span>Updating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Target className="w-3.5 h-3.5" />
                                                        <span>Update Budget</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-gray-600">Budget data not found.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}