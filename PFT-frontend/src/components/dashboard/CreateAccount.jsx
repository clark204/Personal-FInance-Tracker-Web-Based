import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, CreditCard, TrendingUp, DollarSign, ArrowLeft, Globe, ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useAccount } from '../../hooks/account';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../hooks/currency';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateAccount() {
    const { createAccount } = useAccount();
    const { getCurrencies } = useCurrency();
    const { data: currencies, isLoading: currenciesLoading } = getCurrencies;
    const [accountName, setAccountName] = useState('');
    const [accountType, setAccountType] = useState('Cash');
    const [initialBalance, setInitialBalance] = useState('0.00');
    const [currency, setCurrency] = useState('1');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, checkUserAccounts } = useAuth();

    const accountTypes = [
        { value: 'Cash', label: 'Cash', icon: Wallet, color: 'text-emerald-400' },
        { value: 'Credit Card', label: 'Credit Card', icon: CreditCard, color: 'text-rose-400' },
        { value: 'General', label: 'General', icon: TrendingUp, color: 'text-blue-400' },
    ];

    useEffect(() => {
        // If user came here by skipping, remove the skip flag
        if (location.state?.skipAccountCreation) {
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleBalanceChange = (e) => {
        const value = e.target.value;
        if (value === '' || value === '0' || (parseFloat(value) >= 0 && !isNaN(parseFloat(value)))) {
            setInitialBalance(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!accountName.trim()) {
            setError('Please enter an account name');
            return;
        }

        if (!currency) {
            setError('Please select a currency');
            return;
        }

        setIsSubmitting(true);

        try {
            const accountData = {
                account_name: accountName.trim(),
                type: accountType,
                currency_id: parseInt(currency),
                balance: initialBalance === '' || initialBalance === '0' ? 0 : parseFloat(initialBalance)
            };

            await createAccount.mutateAsync(accountData);
            
            // Refresh account check and navigate to dashboard
            await checkUserAccounts();
            navigate('/dashboard');
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
            console.error('Account creation error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToLogin = async () => {
        console.log('Logging out and going back to login');
        try {
            // Clear any skip flags when logging out
            localStorage.removeItem('skipAccountCreation');
            localStorage.removeItem('skipTimestamp');
            
            // Log out the user
            await logout();
            
            // Navigate to login page
            navigate('/auth?mode=login');
        } catch (err) {
            console.error('Error during logout:', err);
            // Even if logout fails, still navigate to login
            navigate('/auth?mode=login');
        }
    };

    const handleCurrencySelect = (currencyId) => {
        setCurrency(currencyId.toString());
        setShowCurrencyDropdown(false);
    };

    const selectedCurrency = currencies?.find(c => c.id === parseInt(currency));

    return (
        <div className="min-h-screen bg-main overflow-auto">
            {/* Background gradients */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-main/95 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center justify-between h-16 px-6 mx-auto">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[url('/FT.svg')] bg-cover bg-no-repeat bg-center rounded-md shadow-md shadow-emerald-500/20"></div>
                        <span className="text-emerald-300 text-xl font-semibold tracking-wide">
                            Finance<span className="text-emerald-500">Tracker</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToLogin}
                            className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="min-h-screen pt-32 pb-20 relative z-10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-md mx-auto"
                    >
                        {/* Welcome Card */}
                        <div className="text-center mb-12 space-y-6">
                            <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <Wallet className="w-5 h-5 text-emerald-400" />
                                <span className="text-emerald-400 text-sm font-medium">Account Setup</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl text-white leading-tight">
                                Welcome to{" "}
                                <span className="bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                                    FinanceTrack!
                                </span>
                            </h1>

                            <p className="text-gray-400 text-lg">
                                Let's set up your first account to begin your financial journey
                            </p>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Account Name */}
                                <div>
                                    <label htmlFor="accountName" className="text-sm font-medium text-gray-300 mb-3 block">
                                        Account Name *
                                    </label>
                                    <div className="relative">
                                        <Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            id="accountName"
                                            type="text"
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            placeholder="e.g., Personal Wallet"
                                            autoComplete="off"
                                            required
                                            disabled={isSubmitting}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white 
                                                     focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all
                                                     disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                                        />
                                    </div>
                                </div>

                                {/* Account Type */}
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-3 block">
                                        Account Type *
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {accountTypes.map((type) => {
                                            const Icon = type.icon;
                                            const isSelected = accountType === type.value;
                                            return (
                                                <motion.button
                                                    type="button"
                                                    key={type.value}
                                                    onClick={() => setAccountType(type.value)}
                                                    disabled={isSubmitting}
                                                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                                                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                                                    className={`
                                                        p-4 rounded-xl border text-sm flex flex-col items-center justify-center gap-2.5 
                                                        transition-all duration-300 cursor-pointer relative
                                                        ${isSelected 
                                                            ? `${type.value === 'Cash' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 
                                                               type.value === 'Credit Card' ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 
                                                               'border-blue-500/50 bg-blue-500/10 text-blue-400'}`
                                                            : 'border-white/10 bg-white/5 text-gray-300 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                                                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                                                        >
                                                            <Check className="w-3 h-3 text-white" />
                                                        </motion.div>
                                                    )}
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{type.label}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Currency Selector */}
                                <div>
                                    <label className="text-sm font-medium text-gray-300 mb-3 block">
                                        Currency *
                                    </label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                        <button
                                            type="button"
                                            onClick={() => !isSubmitting && setShowCurrencyDropdown(!showCurrencyDropdown)}
                                            disabled={isSubmitting || currenciesLoading}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white 
                                                     focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all
                                                     disabled:opacity-50 disabled:cursor-not-allowed text-left flex items-center justify-between"
                                        >
                                            {currenciesLoading ? (
                                                <span className="text-gray-400">Loading currencies...</span>
                                            ) : selectedCurrency ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{selectedCurrency.symbol}</span>
                                                    <span>{selectedCurrency.name} ({selectedCurrency.code})</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">Select a currency</span>
                                            )}
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Currency Dropdown */}
                                        <AnimatePresence>
                                            {showCurrencyDropdown && currencies && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute top-full left-0 right-0 mt-1 bg-main border border-white/10 rounded-xl shadow-2xl shadow-black/50 
                                                             max-h-64 overflow-y-auto z-50 backdrop-blur-sm"
                                                >
                                                    <div className="p-2">
                                                        {currencies.map((curr) => (
                                                            <button
                                                                key={curr.id}
                                                                type="button"
                                                                onClick={() => handleCurrencySelect(curr.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 
                                                                         transition-colors duration-200 ${currency === curr.id.toString() ? 'bg-emerald-500/10 border border-emerald-500/20' : ''}`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center 
                                                                              ${currency === curr.id.toString() ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                                                    <span className="text-sm font-medium">{curr.symbol}</span>
                                                                </div>
                                                                <div className="text-left flex-1">
                                                                    <div className="text-white font-medium">{curr.name}</div>
                                                                    <div className="text-gray-400 text-sm">{curr.code}</div>
                                                                </div>
                                                                {currency === curr.id.toString() && (
                                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Initial Balance */}
                                <div>
                                    <label htmlFor="initialBalance" className="text-sm font-medium text-gray-300 mb-3 block">
                                        Initial Balance
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            id="initialBalance"
                                            type="number"
                                            value={initialBalance}
                                            onChange={handleBalanceChange}
                                            placeholder="0.00"
                                            autoComplete="off"
                                            min="0"
                                            step="0.01"
                                            disabled={isSubmitting}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white 
                                                     focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 transition-all
                                                     disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-500"
                                        />
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500">
                                        Enter 0 or leave empty to start with zero balance
                                    </p>
                                </div>

                                {/* Create Account Button - Removed "Skip for now" */}
                                <div className="pt-6">
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting || !accountName.trim() || !currency}
                                        whileHover={{ scale: isSubmitting || !accountName.trim() || !currency ? 1 : 1.02 }}
                                        whileTap={{ scale: isSubmitting || !accountName.trim() || !currency ? 1 : 0.98 }}
                                        className="w-full py-4 bg-linear-to-r from-emerald-500 to-teal-600 text-main font-medium rounded-xl 
                                                 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                 focus:ring-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                                                 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-main/30 border-t-main rounded-full animate-spin" />
                                                <span>Creating Account...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-5 h-5" />
                                                <span>Create Account</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                {/* Info */}
                                <div className="text-center pt-6 border-t border-white/10">
                                    <p className="text-sm text-gray-400">
                                        You can add more accounts later from the Accounts page
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Note: You need to create at least one account to use the dashboard
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-500 text-sm">
                                Need help? Contact our support at{" "}
                                <a href="mailto:support@financetracker.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                    support@financetracker.com
                                </a>
                            </p>
                            <p className="text-gray-500 text-xs mt-2">
                                To return to login, use the "Back to Login" button in the top right
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-main border-t border-white/10 py-8">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="bg-[url('/FT.svg')] bg-center bg-cover w-6 h-6 bg-linear-to-br from-emerald-400 to-teal-500 rounded-md flex items-center justify-center"></div>
                        <span className="text-white text-sm">FinanceTracker</span>
                    </div>
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} FinanceTracker. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}