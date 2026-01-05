// components/Settings.js
import React, { useEffect, useState } from "react";
import {
    Bell,
    Shield,
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
    Save,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { useSetting } from "../../hooks/setting";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

// Account Deletion Modal Component
const AccountDeletionModal = ({ isOpen, onClose, onDelete, isDeleting }) => {
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            if (!password) {
                toast.error('Please enter your password');
                return;
            }
            setStep(2);
        } else {
            if (confirmation !== 'DELETE MY ACCOUNT PERMANENTLY') {
                toast.error('Please type exactly "DELETE MY ACCOUNT PERMANENTLY"');
                return;
            }
            
            await onDelete(password, confirmation);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Delete Account</h3>
                    </div>
                    <p className="text-gray-600">
                        {step === 1 
                            ? 'This action cannot be undone. Please enter your password to continue.' 
                            : 'Type "DELETE MY ACCOUNT PERMANENTLY" to confirm deletion.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter your password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="Your current password"
                                    required
                                    disabled={isDeleting}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type exactly: DELETE MY ACCOUNT PERMANENTLY
                                </label>
                                <input
                                    type="text"
                                    value={confirmation}
                                    onChange={(e) => setConfirmation(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder='Type "DELETE MY ACCOUNT PERMANENTLY"'
                                    required
                                    disabled={isDeleting}
                                />
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-700">
                                    ⚠️ Warning: This will permanently delete all your data including accounts, transactions, budgets, and savings. This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setPassword('');
                                setConfirmation('');
                                onClose();
                            }}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : step === 1 ? (
                                'Continue'
                            ) : (
                                'Delete Account'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Settings() {
    const { user, setUser } = useAuth();
    const { updateNotification, changePassword, deleteAccount } = useSetting();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    // Handle account deletion
    const handleDeleteAccount = async (password, confirmation) => {
        try {
            await deleteAccount.mutateAsync({
                password: password,
                confirmation: confirmation
            });
            // Modal will close automatically on success
        } catch (error) {
            // Error is already handled by the mutation's onError
            console.error('Account deletion error:', error);
        }
    };

    // Handle notification save with feedback
    const handleSaveNotifications = async () => {
        try {
            setSaveNotificationStatus("saving");
            
            const updated = await updateNotification.mutateAsync({
                email_notifications: emailNotif,
                budget_alerts: budgetAlert,
                savings_alerts: savingsAlert,
            });

            // Update user in context
            const newUser = { 
                ...user, 
                email_notifications: emailNotif, 
                budget_alerts: budgetAlert, 
                savings_alerts: savingsAlert 
            };
            setUser(newUser);
            localStorage.setItem("user", JSON.stringify(newUser));

            setSaveNotificationStatus("saved");
            setTimeout(() => setSaveNotificationStatus(""), 2000);
        } catch (error) {
            console.error(error);
            setSaveNotificationStatus("");
        }
    };

    // Handle password change with validation (simplified)
    const handleChangePassword = async () => {
        // Clear previous errors
        setPasswordError("");

        // Basic validation
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

        try {
            // Call the mutation
            await changePassword.mutateAsync({
                current: passwords.current,
                new: passwords.new,
                confirm: passwords.confirm
            });

            // Clear password fields on success
            setPasswords({ current: "", new: "", confirm: "" });
            
        } catch (error) {
            // Error is already handled by the mutation's onError
            console.error('Password change error:', error);
        }
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Notifications */}
                    <div className="space-y-6">
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
                                        disabled={saveNotificationStatus === "saving" || updateNotification.isLoading}
                                        className="w-full py-3 bg-button text-white font-semibold rounded-lg hover:bg-hover-button disabled:opacity-70 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        {saveNotificationStatus === "saving" || updateNotification.isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
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

                    {/* Right Column - Security & About */}
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
                                            disabled={changePassword.isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
                                            disabled={changePassword.isLoading}
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
                                            placeholder="Enter new password (min 8 characters)"
                                            value={passwords.new}
                                            onChange={(e) => handlePasswordChange("new", e.target.value)}
                                            disabled={changePassword.isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
                                            disabled={changePassword.isLoading}
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
                                            disabled={changePassword.isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
                                            disabled={changePassword.isLoading}
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4 text-text-secondary" /> : <Eye className="w-4 h-4 text-text-secondary" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={changePassword.isLoading}
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-button text-white font-semibold rounded-lg hover:bg-hover-button disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                                >
                                    {changePassword.isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Changing Password...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Change Password
                                        </>
                                    )}
                                </button>

                                {/* Security Tips - Simplified */}
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
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            Can be any combination of characters
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            Uppercase, numbers, and symbols are optional
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

                {/* Danger Zone - UPDATED */}
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

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={deleteAccount.isLoading}
                                    className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteAccount.isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Power className="w-5 h-5" />
                                            Delete Account Permanently
                                        </>
                                    )}
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

            {/* Account Deletion Modal */}
            <AccountDeletionModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={handleDeleteAccount}
                isDeleting={deleteAccount.isLoading}
            />
        </div>
    );
}