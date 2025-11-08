import React from "react";
import {
    User,
    Mail,
    Edit,
    Wallet,
    TrendingUp,
    TrendingDown,
    CreditCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {

    const {user} = useAuth();

    return (
        <div className="h-screen overflow-auto bg-gradient-to-b from-primary-gradient to-secondary-gradient p-6 text-color-text">
            {/* Profile Header */}
            <div className="bg-white border border-color-border rounded-xl shadow-sm p-6 flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-main to-main-light flex items-center justify-center text-white text-2xl font-bold">
                            JD
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-color-border">
                            <User className="w-4 h-4 text-color-main" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-color-text">
                            {user.name}
                        </h2>
                        <p className="flex items-center gap-2 text-color-text-secondary text-sm">
                            <Mail className="w-4 h-4" /> {user.email}
                        </p>
                    </div>
                </div>
                <button className="bg-color-button hover:bg-color-hover-button text-white text-sm font-medium py-2 px-4 rounded-md transition">
                    <Edit className="w-4 h-4 inline mr-1" />
                    Edit Profile
                </button>
            </div>

            {/* Financial Overview */}
            <div className="bg-white border border-color-border rounded-xl shadow-sm p-6 mb-6">
                <h3 className="font-semibold text-color-text mb-1">
                    Financial Overview
                </h3>
                <p className="text-sm text-color-text-secondary mb-4">
                    Your complete financial summary
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Balance */}
                    <div className="flex items-center gap-3 bg-balance/10 border border-color-border rounded-lg p-4">
                        <div className="bg-balance/20 text-balance p-3 rounded-full">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-color-text-secondary">
                                Total Balance
                            </p>
                            <p className="text-xl font-semibold text-color-text">
                                $25,770.50
                            </p>
                        </div>
                    </div>

                    {/* Total Income */}
                    <div className="flex items-center gap-3 bg-income/10 border border-color-border rounded-lg p-4">
                        <div className="bg-income/20 text-income p-3 rounded-full">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-color-text-secondary">
                                Total Income
                            </p>
                            <p className="text-xl font-semibold text-income">
                                $7,000
                            </p>
                        </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="flex items-center gap-3 bg-expense/10 border border-color-border rounded-lg p-4">
                        <div className="bg-expense/20 text-expense p-3 rounded-full">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-color-text-secondary">
                                Total Expenses
                            </p>
                            <p className="text-xl font-semibold text-expense">
                                $829.99
                            </p>
                        </div>
                    </div>

                    {/* Active Accounts */}
                    <div className="flex items-center gap-3 bg-accounts/10 border border-color-border rounded-lg p-4">
                        <div className="bg-accounts/20 text-accounts p-3 rounded-full">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-color-text-secondary">
                                Active Accounts
                            </p>
                            <p className="text-xl font-semibold text-color-text">
                                4
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budgets & Transaction Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Budgets & Goals */}
                <div className="bg-white border border-color-border rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-color-text mb-4">
                        Budgets & Goals
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-color-border pb-2">
                            <span className="text-color-text-secondary">
                                Active Budgets
                            </span>
                            <span className="font-medium">6</span>
                        </div>
                        <div className="flex justify-between border-b border-color-border pb-2">
                            <span className="text-color-text-secondary">
                                Savings Goals
                            </span>
                            <span className="font-medium">4</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-color-text-secondary">
                                Avg. Goals Progress
                            </span>
                            <span className="font-semibold text-color-main">
                                59%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white border border-color-border rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-color-text mb-4">
                        Transaction History
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between border-b border-color-border pb-2">
                            <span className="text-color-text-secondary">
                                Total Transactions
                            </span>
                            <span className="font-medium">15</span>
                        </div>
                        <div className="flex justify-between border-b border-color-border pb-2">
                            <span className="text-color-text-secondary">
                                This Month
                            </span>
                            <span className="font-medium">15</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-color-text-secondary">
                                Savings Rate
                            </span>
                            <span className="font-semibold text-income">
                                88.1%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Preferences */}
            <div className="bg-white border border-color-border rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-color-text mb-4">
                    Account Preferences
                </h3>
                <div className="text-sm space-y-2">
                    <div className="flex justify-between border-b border-color-border pb-2">
                        <span className="text-color-text-secondary">
                            Preferred Currency
                        </span>
                        <span className="font-medium">USD</span>
                    </div>
                    <div className="flex justify-between border-b border-color-border pb-2">
                        <span className="text-color-text-secondary">
                            Date Format
                        </span>
                        <span className="font-medium">MM/DD/YYYY</span>
                    </div>
                    <div className="flex justify-between border-b border-color-border pb-2">
                        <span className="text-color-text-secondary">
                            Email Notifications
                        </span>
                        <span className="font-medium text-income">
                            Enabled
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-color-text-secondary">
                            Budget Alerts
                        </span>
                        <span className="font-medium text-income">
                            Enabled
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
