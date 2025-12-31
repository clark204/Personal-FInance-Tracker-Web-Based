import React, { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import { Plus, Trash2, SquarePen, Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, Building, Coins, Eye, EyeOff, Filter, ChevronDown, Search, Loader, ArrowUpRight, ArrowDownRight, Calendar, Tag, MoreHorizontal } from "lucide-react";
import AccountModal from "../modal/account/AccountModal";
import { useAccount } from "../../hooks/account";
import EditAccountModal from "../modal/EditAccountModal";
import { Bounce, toast } from "react-toastify";
import ConfirmModal from "../common/confirmModal";

export default function Account() {
    const { getAccounts, deleteAccount } = useAccount();

    const accounts = getAccounts.data?.account || [];
    const isLoading = getAccounts.isLoading;

    const mobileVP = useMediaQuery({ maxWidth: 768 });
    const [showFilters, setShowFilters] = useState(false);
    const [showBalance, setShowBalance] = useState(true);
    const [accountModal, setAccountModal] = useState(false);
    const [editAccount, setEditAccount] = useState(false);
    const [accountID, setAccountID] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedAccount, setExpandedAccount] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        type: "all",
        sortBy: "balance_desc"
    });

    // Calculate account-specific totals
    const calculateAccountStats = (account) => {
        if (!account.transactions || account.transactions.length === 0) {
            return { totalIncome: 0, totalExpense: 0, netChange: 0, transactionCount: 0 };
        }

        const income = account.transactions
            .filter(tx => tx.type === "Income")
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        const expense = account.transactions
            .filter(tx => tx.type === "Expense")
            .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

        return {
            totalIncome: income,
            totalExpense: expense,
            netChange: income - expense,
            transactionCount: account.transactions.length
        };
    };

    // Filter and sort accounts
    const filteredAccounts = accounts
        .filter(account => {
            // Search filter
            if (searchTerm && !account.account_name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            // Type filter
            if (filters.type !== "all" && account.type !== filters.type) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            const balanceA = parseFloat(a.balance || 0);
            const balanceB = parseFloat(b.balance || 0);
            
            switch (filters.sortBy) {
                case "name_asc":
                    return a.account_name.localeCompare(b.account_name);
                case "name_desc":
                    return b.account_name.localeCompare(a.account_name);
                case "balance_asc":
                    return balanceA - balanceB;
                case "balance_desc":
                    return balanceB - balanceA;
                default:
                    return balanceB - balanceA;
            }
        });

    const getAccountIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'cash':
                return <DollarSign className="w-5 h-5 text-white" />;
            case 'bank':
            case 'savings':
                return <Building className="w-5 h-5 text-white" />;
            case 'credit card':
                return <CreditCard className="w-5 h-5 text-white" />;
            case 'investment':
                return <TrendingUp className="w-5 h-5 text-white" />;
            default:
                return <Wallet className="w-5 h-5 text-white" />;
        }
    };

    const getAccountColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'cash':
                return "bg-gradient-to-br from-green-500 to-green-600";
            case 'bank':
                return "bg-gradient-to-br from-blue-500 to-blue-600";
            case 'savings':
                return "bg-gradient-to-br from-purple-500 to-purple-600";
            case 'credit card':
                return "bg-gradient-to-br from-red-500 to-red-600";
            case 'investment':
                return "bg-gradient-to-br from-amber-500 to-amber-600";
            default:
                return "bg-gradient-to-br from-main to-main-light";
        }
    };

    const getAccountTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'cash':
                return "bg-green-100 text-green-800";
            case 'bank':
                return "bg-blue-100 text-blue-800";
            case 'savings':
                return "bg-purple-100 text-purple-800";
            case 'credit card':
                return "bg-red-100 text-red-800";
            case 'investment':
                return "bg-amber-100 text-amber-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatCurrency = (amount, currencySymbol = null) => {
        const numAmount = parseFloat(amount || 0);
        const symbol = currencySymbol || "$";
        return showBalance 
            ? `${symbol}${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "••••••";
    };

    const formatBalance = (balance, currencySymbol) => {
        return formatCurrency(balance, currencySymbol);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    // Get recent transactions (last 3)
    const getRecentTransactions = (account) => {
        if (!account.transactions || account.transactions.length === 0) {
            return [];
        }
        
        // Sort by date (newest first) and take first 3
        return [...account.transactions]
            .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
            .slice(0, 3);
    };

    // Get category name or fallback
    const getCategoryName = (transaction) => {
        if (transaction.category?.category_name) {
            return transaction.category.category_name;
        }
        if (transaction.category_id) {
            return `Category ${transaction.category_id}`;
        }
        return "Uncategorized";
    };

    // Loading skeleton for cards
    const LoadingCard = () => (
        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden animate-pulse">
            <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300"></div>
            <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 w-32 bg-gray-300 rounded mb-1"></div>
                        <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-3 mb-4">
                    <div className="h-4 w-full bg-gray-100 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-gradient-to-b from-primary-gradient to-secondary-gradient overflow-auto">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">Accounts</h1>
                        <p className="text-text-secondary">Manage your financial accounts in one place</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Show/Hide Balance Toggle */}
                        <button
                            onClick={() => setShowBalance(!showBalance)}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border text-main hover:border-button hover:bg-button/5 transition-colors"
                            title={showBalance ? "Hide all balances" : "Show all balances"}
                        >
                            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>{showBalance ? "Hide Balances" : "Show Balances"}</span>
                        </button>
                        
                        <button 
                            onClick={() => setAccountModal(true)}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-button text-white rounded-lg hover:bg-hover-button transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-xl shadow-lg border border-border mb-6 overflow-hidden">
                <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-secondary-gradient rounded-lg">
                                <Filter className="w-5 h-5 text-icon" />
                            </div>
                            <h2 className="text-lg font-semibold text-main">Filters</h2>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="cursor-pointer flex items-center gap-1 text-sm text-text-secondary hover:text-main transition-colors"
                        >
                            {showFilters ? "Hide Filters" : "Show Filters"}
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Search */}
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-main mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search accounts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                                        />
                                    </div>
                                </div>

                                {/* Account Type Filter */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2 block">Account Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank">Bank</option>
                                        <option value="Savings">Savings</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Investment">Investment</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {/* Sort By */}
                                <div>
                                    <label className="text-sm font-medium text-main mb-2 block">Sort By</label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition"
                                    >
                                        <option value="balance_desc">Balance (High to Low)</option>
                                        <option value="balance_asc">Balance (Low to High)</option>
                                        <option value="name_asc">Name (A to Z)</option>
                                        <option value="name_desc">Name (Z to A)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-4 border-t border-border">
                                <span className="text-sm text-text-secondary">
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </div>
                                    ) : (
                                        `${filteredAccounts.length} accounts found`
                                    )}
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSearchTerm("");
                                            setFilters({
                                                type: "all",
                                                sortBy: "balance_desc"
                                            });
                                        }}
                                        className="cursor-pointer px-5 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:border-expense hover:text-expense transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Cards Container */}
            <div className={`grid gap-6 ${mobileVP ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                {isLoading ? (
                    // Loading state
                    Array.from({ length: 3 }).map((_, index) => (
                        <LoadingCard key={index} />
                    ))
                ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((account) => {
                        const stats = calculateAccountStats(account);
                        const recentTransactions = getRecentTransactions(account);
                        const currencySymbol = account.currency?.symbol || "$";
                        const currencyCode = account.currency?.code || "USD";
                        const isExpanded = expandedAccount === account.id;

                        return (
                            <div 
                                key={account.id} 
                                className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                {/* Account Header with gradient */}
                                <div className={`${getAccountColor(account.type)} text-white p-6`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="p-2 bg-white/20 rounded-lg">
                                                    {getAccountIcon(account.type)}
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                                                    {account.type}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold truncate">{account.account_name}</h3>
                                            <div className="flex items-baseline gap-1 mt-2">
                                                <p className="text-3xl font-bold">
                                                    {formatBalance(account.balance, currencySymbol)}
                                                </p>
                                                <p className="text-sm opacity-80 ml-1">{currencyCode}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Details */}
                                <div className="p-5">
                                    {/* Account Stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                                            <p className="text-xs text-green-700 mb-1">Total Income</p>
                                            <p className="font-bold text-green-900">
                                                {formatCurrency(stats.totalIncome, currencySymbol)}
                                            </p>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3">
                                            <p className="text-xs text-red-700 mb-1">Total Expense</p>
                                            <p className="font-bold text-red-900">
                                                {formatCurrency(stats.totalExpense, currencySymbol)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="flex items-center justify-between mb-4 text-sm">
                                        <div className="text-center flex-1">
                                            <p className="text-text-secondary text-xs">Net Change</p>
                                            <p className={`font-medium ${stats.netChange >= 0 ? 'text-income' : 'text-expense'}`}>
                                                {stats.netChange >= 0 ? '+' : ''}{formatCurrency(stats.netChange, currencySymbol)}
                                            </p>
                                        </div>
                                        <div className="text-center flex-1 border-l border-r border-border">
                                            <p className="text-text-secondary text-xs">Transactions</p>
                                            <p className="font-medium text-main">{stats.transactionCount}</p>
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-text-secondary text-xs">Currency</p>
                                            <p className="font-medium text-main">{currencyCode}</p>
                                        </div>
                                    </div>

                                    {/* Recent Transactions */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <p className="text-sm text-text-secondary font-medium">Recent Transactions</p>
                                            {recentTransactions.length > 0 && (
                                                <button
                                                    onClick={() => setExpandedAccount(isExpanded ? null : account.id)}
                                                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                >
                                                    {isExpanded ? 'Show Less' : `Show ${recentTransactions.length}`}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {recentTransactions.length > 0 ? (
                                            <div className="space-y-2">
                                                {recentTransactions.slice(0, isExpanded ? recentTransactions.length : 2).map((transaction, index) => {
                                                    const categoryName = getCategoryName(transaction);
                                                    const transactionDate = transaction.date || transaction.created_at;
                                                    
                                                    return (
                                                        <div 
                                                            key={transaction.id || index} 
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-1.5 rounded ${transaction.type === 'Income' ? 'bg-income/10' : 'bg-expense/10'}`}>
                                                                        {transaction.type === 'Income' ? (
                                                                            <ArrowUpRight className="w-3 h-3 text-income" />
                                                                        ) : (
                                                                            <ArrowDownRight className="w-3 h-3 text-expense" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-sm font-medium text-main truncate">
                                                                            {transaction.description || 'No description'}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            <span>{formatDate(transactionDate)}</span>
                                                                            <span>•</span>
                                                                            <span className={`px-2 py-0.5 rounded-full ${transaction.type === 'Income' ? 'bg-income/10 text-income' : 'bg-expense/10 text-expense'}`}>
                                                                                {transaction.type}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right ml-3">
                                                                <p className={`text-sm font-semibold ${transaction.type === 'Income' ? 'text-income' : 'text-expense'}`}>
                                                                    {transaction.type === 'Income' ? '+' : '-'}{formatCurrency(transaction.amount, currencySymbol)}
                                                                </p>
                                                                <div className="text-xs text-text-secondary mt-1 flex items-center justify-end gap-1">
                                                                    <Tag className="w-3 h-3" />
                                                                    <span className="max-w-[80px] truncate">{categoryName}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 border border-dashed border-gray-200 rounded-lg">
                                                <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">No recent transactions</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditAccount(true);
                                                setAccountID(account.id);
                                            }}
                                            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg text-main hover:border-button hover:bg-button/5 transition-colors"
                                        >
                                            <SquarePen className="w-4 h-4" />
                                            <span className="text-sm font-medium">Edit</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedAccount(account);
                                                setShowConfirm(true);
                                            }}
                                            className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-200 rounded-lg text-expense hover:border-expense hover:bg-expense/5 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center mb-4">
                            <Wallet className="w-8 h-8 text-icon" />
                        </div>
                        <h3 className="text-lg font-semibold text-main mb-2">No Accounts Found</h3>
                        <p className="text-text-secondary mb-6 max-w-md">
                            {searchTerm || filters.type !== "all" 
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Add your first account to start tracking your finances."
                            }
                        </p>
                        <button
                            onClick={() => setAccountModal(true)}
                            className="cursor-pointer px-4 py-2 bg-button text-white rounded-lg hover:bg-hover-button transition-colors"
                        >
                            <Plus className="w-4 h-4 inline mr-2" />
                            Add Account
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AccountModal 
                isOpen={accountModal} 
                onClose={() => { 
                    setAccountModal(false);
                }} 
            />
            <EditAccountModal 
                isOpen={editAccount} 
                onClose={() => { 
                    setEditAccount(false);
                    setAccountID(0);
                }} 
                ID={accountID} 
            />
            <ConfirmModal
                show={showConfirm}
                text={`Are you sure you want to delete "${selectedAccount?.account_name}"? This action cannot be undone.`}
                onClose={() => {
                    setShowConfirm(false);
                    setSelectedAccount(null);
                }}
                onSubmit={() => {
                    if (!selectedAccount) return;

                    deleteAccount.mutate(selectedAccount.id, {
                        onSuccess: () => {
                            setShowConfirm(false);
                            setSelectedAccount(null);
                        },
                    });
                }}
            />
        </div>
    );
}