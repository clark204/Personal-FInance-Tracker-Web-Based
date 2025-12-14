import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useBudget } from "../../hooks/budget";
import { useEffect, useState } from "react";
import Category from "../common/CategoryDropdown";
import { useAccount } from "../../hooks/account";
import AccountDropdown from "../common/AccountDropdown";

export default function EditBudgetModal({ isOpen, onClose, budgetID }) {
    const { showBudget, updateBudget } = useBudget(budgetID);
    const { getAccounts } = useAccount();
    const details = showBudget.data;
    const accounts = getAccounts?.data?.account || [];

    const [formData, setFormData] = useState({
        account_id: "",
        category_id: "",
        budget_amount: "",
        start_date: "",
        end_date: "",
        period: ""
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

        const updateData = {
            id: budgetID,
            account_id: Number(formData.account_id) || null,
            category_id: Number(formData.category_id) || null,
            budget_amount: Number(formData.budget_amount) || 0,
            period_type: formData.period,
            start_date: formData.period === "custom" ? formData.start_date : null,
            end_date: formData.period === "custom" ? formData.end_date : null,
        };

        console.log("Updating budget with data:", updateData);

        updateBudget.mutate(updateData, {
            onSuccess: () => {
                onClose();
            }
        });
    }

    useEffect(() => {
        if (details) {
            setFormData({
                account_id: details.account_id || "",
                category_id: details.category?.id || "",
                budget_amount: details.budget_amount || "",
                start_date: details.start_date || "",
                end_date: details.end_date || "",
                period: details.period_type || ""
            });
        }
    }, [details]);

    if (!isOpen || budgetID == null) return null;

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
                            Edit Budget
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-text" />
                        </button>
                    </div>

                    {!details ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
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
                                    aria-label="update budget"
                                    disabled={!isFormValid}
                                    className="px-4 py-2 rounded-lg border border-border bg-button text-white font-medium hover:bg-hover-button transition"
                                >
                                    Update Budget
                                </button>
                            </div>
                        </form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}