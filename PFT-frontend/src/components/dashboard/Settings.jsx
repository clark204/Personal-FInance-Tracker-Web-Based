import React, { useEffect, useState } from "react";
import {
    Bell,
    Shield,
    Moon,
    Eye,
    EyeOff,
    Lock,
    Trash2,
    Power,
    Key,
    Settings as SettingsIcon,
    Mail,
    AlertCircle,
    DollarSign,
    CheckCircle,
    Save
} from "lucide-react";
import { useSetting } from "../../hooks/setting";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
    const { user, setUser } = useAuth();
    const { updateNotification } = useSetting();
    console.log(user);

    // Notification states
    const [emailNotif, setEmailNotif] = useState(false);
    const [budgetAlert, setBudgetAlert] = useState(false);
    const [savingsAlert, setSavingsAlert] = useState(false);

    useEffect(() => {
        if (user) {
            setEmailNotif(Boolean(user.email_notifications));
            setBudgetAlert(Boolean(user.budget_alerts));
            setSavingsAlert(Boolean(user.savings_alerts));
        }
    }, [user]);

    const [darkMode, setDarkMode] = useState(false);

    // Password states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    });
    const [passwordError, setPasswordError] = useState("");
    const [saveNotificationStatus, setSaveNotificationStatus] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Handle notification save with feedback
    const handleSaveNotifications = async () => {
        // Simulate API call
        setSaveNotificationStatus("saving");
        setTimeout(() => {
            setSaveNotificationStatus("saved");
            // Reset status after 2 seconds
            setTimeout(() => setSaveNotificationStatus(""), 2000);
        }, 800);

        try {
            const updated = await updateNotification.mutateAsync({
                email_notifications: emailNotif,
                budget_alerts: budgetAlert,
                savings_alerts: savingsAlert,
            });

            // Update user in context
            const newUser = { ...user, email_notifications: emailNotif, budget_alerts: budgetAlert, savings_alerts: savingsAlert };
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));

            setSaveNotificationStatus("saved");
            setTimeout(() => setSaveNotificationStatus(""), 2000);
        } catch (error) {
            console.error(error);
            setSaveNotificationStatus("");
        }
    };

    // Handle password change with validation
    const handleChangePassword = () => {
        // Validation
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setPasswordError("All password fields are required");
            return;
        }

        if (passwords.new.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setPasswordError("New passwords don't match");
            return;
        }

        // Password complexity check
        const hasUpperCase = /[A-Z]/.test(passwords.new);
        const hasNumber = /\d/.test(passwords.new);
        if (!hasUpperCase || !hasNumber) {
            setPasswordError("Password must contain at least one uppercase letter and one number");
            return;
        }

        setPasswordError("");
        setIsChangingPassword(true);

        console.log("Changing password:", {
            current: passwords.current,
            new: passwords.new
        });

        // Simulate API call
        setTimeout(() => {
            setIsChangingPassword(false);
            // Clear password fields
            setPasswords({ current: "", new: "", confirm: "" });

            // Show success message (in a real app, use toast notification)
            alert("Password changed successfully!");
        }, 1500);

        // Add actual API call here
        // fetch('/api/auth/change-password', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(passwords)
        // })
    };

    const handleDeleteAccountData = () => {
        if (window.confirm("Are you sure you want to delete all account data? This action cannot be undone.")) {
            console.log("Deleting all account data");
            // Add delete logic here with proper confirmation
            // fetch('/api/account/delete-data', { method: 'DELETE' })
        }
    };

    const handleDeactivateAccount = () => {
        if (window.confirm("Are you sure you want to deactivate your account? You can reactivate within 30 days.")) {
            console.log("Deactivating account");
            // Add deactivation logic here
            // fetch('/api/account/deactivate', { method: 'POST' })
        }
    };

    // Handle password input changes
    const handlePasswordChange = (field, value) => {
        setPasswords(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when user starts typing
        if (passwordError) setPasswordError("");
    };

    return (
        <div className="p-6 space-y-8 h-screen overflow-auto bg-gradient-to-b from-primary-gradient to-secondary-gradient">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-main to-main-light rounded-2xl p-6 md:p-8 text-white">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Settings</h1>
                        <p className="text-white/90">Customize your application preferences and security</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Display Preferences */}
                        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
                            <div className="bg-gradient-to-r from-main/5 to-main-light/5 border-b border-border/30 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-main to-main-light rounded-xl">
                                        <Moon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-main">Display Preferences</h2>
                                        <p className="text-sm text-text-secondary">Customize your app appearance</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gray-100 rounded-lg">
                                            <Moon className="w-5 h-5 text-gray-700" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-main">Dark Mode</p>
                                            <p className="text-sm text-text-secondary">Switch to dark theme for better visibility in low light</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={darkMode}
                                            onChange={() => setDarkMode(!darkMode)}
                                        />
                                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-main"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
                            <div className="bg-gradient-to-r from-main/5 to-main-light/5 border-b border-border/30 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-main to-main-light rounded-xl">
                                        <Bell className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-main">Notifications</h2>
                                        <p className="text-sm text-text-secondary">Manage how you receive notifications and alerts</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {[
                                        {
                                            label: "Email Notifications",
                                            desc: "Receive notifications via email",
                                            icon: <Mail className="w-4 h-4" />,
                                            checked: emailNotif,
                                            setter: setEmailNotif
                                        },
                                        {
                                            label: "Budget Alerts",
                                            desc: "Get notified when you're close to budget limits",
                                            icon: <AlertCircle className="w-4 h-4" />,
                                            checked: budgetAlert,
                                            setter: setBudgetAlert
                                        },
                                        {
                                            label: "Savings Goals Alerts",
                                            desc: "Get notified about savings goal progress",
                                            icon: <DollarSign className="w-4 h-4" />,
                                            checked: savingsAlert,
                                            setter: setSavingsAlert
                                        }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-main">{item.label}</p>
                                                    <p className="text-sm text-text-secondary">{item.desc}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={item.checked}
                                                    onChange={() => item.setter(!item.checked)}
                                                />
                                                <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-main"></div>
                                            </label>
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleSaveNotifications}
                                        disabled={saveNotificationStatus === "saving"}
                                        className="w-full py-3 bg-button text-white font-semibold rounded-lg hover:bg-hover-button disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {saveNotificationStatus === "saving" ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Saving...
                                            </>
                                        ) : saveNotificationStatus === "saved" ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                Settings Saved!
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Notification Settings
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Account Security */}
                        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-border/30 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-500 rounded-xl">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-main">Account Security</h2>
                                        <p className="text-sm text-text-secondary">Change your password</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                {passwordError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        <p className="text-sm font-medium">{passwordError}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-main">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent pr-12"
                                            placeholder="Enter current password"
                                            value={passwords.current}
                                            onChange={(e) => handlePasswordChange("current", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-main">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent pr-12"
                                            placeholder="Enter new password"
                                            value={passwords.new}
                                            onChange={(e) => handlePasswordChange("new", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-main">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="w-full px-4 py-2.5 bg-gray-50 rounded-lg border border-border/30 focus:outline-none focus:ring-2 focus:ring-main focus:border-transparent pr-12"
                                            placeholder="Confirm new password"
                                            value={passwords.confirm}
                                            onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={isChangingPassword}
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-button text-white font-semibold rounded-lg hover:bg-hover-button disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Changing Password...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Change Password
                                        </>
                                    )}
                                </button>

                                {/* Security Tips */}
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                                        <Key className="w-4 h-4" />
                                        Password Requirements
                                    </p>
                                    <div className="text-xs text-blue-700 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${passwords.new.length >= 8 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            Minimum 8 characters
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(passwords.new) ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            Include uppercase letters
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(passwords.new) ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                            At least one number
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden">
                            <div className="bg-gradient-to-r from-main/5 to-main-light/5 border-b border-border/30 p-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-main to-main-light rounded-xl">
                                        <SettingsIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-main">About</h2>
                                        <p className="text-sm text-text-secondary">Application information</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="text-sm space-y-3">
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-text-secondary">Version</span>
                                        <span className="font-medium text-main">1.0.0</span>
                                    </div>
                                    <div className="flex justify-between border-b border-border/30 pb-2">
                                        <span className="text-text-secondary">Last Updated</span>
                                        <span className="font-medium text-main">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-text-secondary mt-4">
                                    FinanceTracker helps you manage your personal finances with ease.
                                    Track expenses, set budgets, and achieve your savings goals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg border border-red-200 overflow-hidden">
                        <div className="p-6 md:p-8">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-red-900 mb-2">Danger Zone</h2>
                                    <p className="text-red-700">
                                        These actions are permanent and cannot be undone. Please proceed with caution.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleDeleteAccountData}
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white border-2 border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Delete All Account Data
                                </button>

                                <button
                                    onClick={handleDeactivateAccount}
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <Power className="w-5 h-5" />
                                    Deactivate Account
                                </button>
                            </div>

                            <div className="mt-6 pt-4 border-t border-red-200">
                                <p className="text-sm text-red-600 text-center">
                                    ⚠️ These actions will permanently remove your data and cannot be recovered.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}