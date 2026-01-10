import { AnimatePresence, motion } from "framer-motion";
import { X, Wallet, CreditCard, Globe, TrendingUp, DollarSign } from "lucide-react";
import { useState, useCallback, memo } from "react";
import Currency from "../../common/Currency";
import { useAccount } from "../../../hooks/account";

// Memoize account type button
const AccountTypeButton = memo(({ type, isSelected, onClick, disabled }) => {
    const Icon = type.icon;
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`p-2.5 rounded-lg border text-sm flex items-center justify-center gap-1.5 transition-colors duration-150 cursor-pointer
                ${isSelected 
                    ? `${type.value === 'Cash' ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 
                       type.value === 'Credit Card' ? 'border-rose-400 bg-rose-50 text-rose-600' : 
                       'border-blue-400 bg-blue-50 text-blue-600'}`
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon className="w-3.5 h-3.5" />
            <span>{type.label}</span>
        </button>
    );
});

AccountTypeButton.displayName = 'AccountTypeButton';

export default function AccountModal({ isOpen, onClose }) {
    const { createAccount } = useAccount();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        accountName: "",
        type: "Cash",
        currency: "",
        balance: "",
    });

    // Memoize handlers
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleCurrencyChange = useCallback((val) => {
        setFormData(prev => ({ ...prev, currency: val }));
    }, []);

    const handleAccountTypeSelect = useCallback((type) => {
        setFormData(prev => ({ ...prev, type }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);

        const accountData = {
            account_name: formData.accountName.trim(),
            type: formData.type,
            currency_id: parseInt(formData.currency),
            balance: parseFloat(formData.balance) || 0
        };

        try {
            await createAccount.mutateAsync(accountData);
            onClose();
        } catch (err) {
            console.error("Error creating account:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, createAccount, onClose, isSubmitting]);

    const accountTypes = [
        { value: "Cash", label: "Cash", icon: Wallet, color: "text-emerald-500" },
        { value: "Credit Card", label: "Credit Card", icon: CreditCard, color: "text-rose-500" },
        { value: "General", label: "General", icon: TrendingUp, color: "text-blue-500" },
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
                        transition={{ duration: 0.1 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
                        onClick={isSubmitting ? undefined : onClose}
                    />

                    {/* Modal - Compact size */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
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
                            <div className="bg-linear-to-r from-primary-gradient to-secondary-gradient border-b border-border/30 p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white rounded-md border border-gray-200">
                                            <Wallet className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-text">
                                                New Account
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                Set up your account details
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
                                {/* Account Name */}
                                <div>
                                    <label htmlFor="accountName" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Account Name *
                                    </label>
                                    <div className="relative">
                                        <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            id="accountName"
                                            type="text"
                                            name="accountName"
                                            value={formData.accountName}
                                            onChange={handleChange}
                                            placeholder="e.g., Personal Wallet"
                                            autoComplete="off"
                                            required
                                            disabled={isSubmitting}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Account Type */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Account Type *
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {accountTypes.map((type) => (
                                            <AccountTypeButton
                                                key={type.value}
                                                type={type}
                                                isSelected={formData.type === type.value}
                                                onClick={() => handleAccountTypeSelect(type.value)}
                                                disabled={isSubmitting}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Currency */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Currency *
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400 z-10" />
                                        <Currency
                                            id="currency"
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleCurrencyChange}
                                            disabled={isSubmitting}
                                            className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Initial Balance */}
                                <div>
                                    <label htmlFor="balance" className="text-xs font-medium text-gray-700 mb-1 block">
                                        Initial Balance *
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <input
                                            id="balance"
                                            type="number"
                                            name="balance"
                                            value={formData.balance}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            autoComplete="off"
                                            min="0"
                                            step="0.01"
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
                                        disabled={isSubmitting}
                                        className="flex-1 px-3 py-2 rounded-lg bg-button text-white text-sm font-medium 
                                                 hover:bg-hover-button transition-colors duration-150
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
                                                <Wallet className="w-3.5 h-3.5" />
                                                <span>Create</span>
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