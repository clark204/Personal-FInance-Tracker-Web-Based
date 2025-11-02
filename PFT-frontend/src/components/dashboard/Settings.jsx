import React, { useState } from "react";
import { Globe, Bell, DollarSign, Calendar } from "lucide-react";

export default function Settings() {
    const [currency, setCurrency] = useState("USD - US Dollar");
    const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
    const [emailNotif, setEmailNotif] = useState(true);
    const [pushNotif, setPushNotif] = useState(true);
    const [budgetAlert, setBudgetAlert] = useState(true);

    return (
        <div className="p-6 space-y-8 h-screen overflow-auto bg-gradient-to-b from-primary-gradient to-secondary-gradient text-text">
            {/* General Settings */}
            <div className="bg-white/90 border border-border rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-5 h-5 text-icon" />
                    <h2 className="font-semibold text-lg text-main">
                        General Settings
                    </h2>
                </div>
                <p className="text-sm text-text-secondary mb-5">
                    Configure your app preferences and display options
                </p>

                <div className="space-y-4">
                    {/* Currency */}
                    <div>
                        <label className="flex items-center gap-2 font-semibold text-sm text-main-light mb-1">
                            <DollarSign className="w-4 h-4 text-icon" /> Currency
                        </label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm text-text focus:ring-2 focus:ring-focus"
                        >
                            <option>USD - US Dollar</option>
                            <option>PHP - Philippine Peso</option>
                            <option>EUR - Euro</option>
                        </select>
                    </div>

                    {/* Date Format */}
                    <div>
                        <label className="flex items-center gap-2 font-semibold text-sm text-main-light mb-1">
                            <Calendar className="w-4 h-4 text-icon" /> Date Format
                        </label>
                        <select
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm text-text focus:ring-2 focus:ring-focus"
                        >
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                        </select>
                    </div>

                    <button className="bg-button text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-hover-button transition">
                        Save Preferences
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/90 border border-border rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-5 h-5 text-icon" />
                    <h2 className="font-semibold text-lg text-main">
                        Notifications
                    </h2>
                </div>
                <p className="text-sm text-text-secondary mb-5">
                    Manage how you receive notifications and alerts
                </p>

                <div className="space-y-5">
                    {/* Email Notifications */}
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-sm text-main-light">
                                Email Notifications
                            </p>
                            <p className="text-xs text-text-secondary">
                                Receive transaction summaries via email
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={emailNotif}
                                onChange={() => setEmailNotif(!emailNotif)}
                            />
                            <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-focus rounded-full peer peer-checked:bg-main transition"></div>
                            <div className="absolute left-1 top-1 bg-white w-3.5 h-3.5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                    </div>

                    {/* Push Notifications */}
                    <div className="flex justify-between items-center border-t border-border pt-4">
                        <div>
                            <p className="font-semibold text-sm text-main-light">
                                Push Notifications
                            </p>
                            <p className="text-xs text-text-secondary">
                                Get real-time notifications for important activities
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={pushNotif}
                                onChange={() => setPushNotif(!pushNotif)}
                            />
                            <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-focus rounded-full peer peer-checked:bg-main transition"></div>
                            <div className="absolute left-1 top-1 bg-white w-3.5 h-3.5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                    </div>

                    {/* Budget Alerts */}
                    <div className="flex justify-between items-center border-t border-border pt-4">
                        <div>
                            <p className="font-semibold text-sm text-main-light">
                                Budget Alerts
                            </p>
                            <p className="text-xs text-text-secondary">
                                Get notified when you’re close to budget limits
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={budgetAlert}
                                onChange={() => setBudgetAlert(!budgetAlert)}
                            />
                            <div className="w-10 h-5 bg-gray-300 peer-focus:ring-2 peer-focus:ring-focus rounded-full peer peer-checked:bg-main transition"></div>
                            <div className="absolute left-1 top-1 bg-white w-3.5 h-3.5 rounded-full transition-transform peer-checked:translate-x-5"></div>
                        </label>
                    </div>

                    <button className="bg-button text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-hover-button transition">
                        Save Notification Settings
                    </button>
                </div>
            </div>

            {/* About */}
            <div className="bg-white/90 border border-border rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-lg text-main mb-4">About</h2>
                <div className="text-sm space-y-2">
                    <div className="flex justify-between border-b border-border pb-2">
                        <span>Version</span>
                        <span className="font-medium">1.0.0</span>
                    </div>
                    <div className="flex justify-between border-b border-border pb-2">
                        <span>Last Updated</span>
                        <span className="font-medium">October 2025</span>
                    </div>
                </div>
                <p className="text-sm text-text-secondary mt-3">
                    FinanceTracker helps you manage your personal finances with ease.
                    Track expenses, set budgets, and achieve your savings goals.
                </p>
            </div>
        </div>
    );
}
