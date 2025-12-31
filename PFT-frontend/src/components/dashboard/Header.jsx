import { Bell, Search, Download, Plus, Menu, X, AlertTriangle, Target, TrendingUp, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import TransactionModal from "../modal/transaction/TransactionModal";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import ExportModal from "../modal/ExportModal";
import { useSetting } from "../../hooks/setting";

export default function Header({ onMenuClick }) {
    const { getNotifications } = useSetting();
    const notificationsData = getNotifications.data;
    
    const location = useLocation();
    const navigate = useNavigate();
    const [transactionModal, setTransactionModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [exportModal, setExportModal] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    useEffect(() => {
        if (notificationsData) {
            setUnreadCount(notificationsData.unread_count || 0);
        }
    }, [notificationsData]);

    const pageTitle = () => {
        const path = location.pathname.toLowerCase();

        if (path.includes("/dashboard/transactions")) return "Transaction";
        if (path.includes("/dashboard/budgets")) return "Budget";
        if (path.includes("/dashboard/goals")) return "Savings Goal";
        if (path.includes("/dashboard/accounts")) return "Accounts";
        return "Dashboard";
    };

    const getNotificationIcon = (type) => {
        if (type.includes('BudgetThresholdReached')) {
            return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        } else if (type.includes('SavingsGoalReached')) {
            return <TrendingUp className="w-4 h-4 text-green-500" />;
        }
        return <Bell className="w-4 h-4 text-blue-500" />;
    };

    const getNotificationTitle = (type) => {
        if (type.includes('BudgetThresholdReached')) {
            return "Budget Alert";
        } else if (type.includes('SavingsGoalReached')) {
            return "Savings Goal";
        }
        return "Notification";
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) {
            return `${diffMins} min ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        }
    };

    const formatMessage = (notification) => {
        if (notification.type.includes('BudgetThresholdReached')) {
            const data = notification.data;
            return `You have spent ${data.percent}% ($${data.spent}) of your $${data.limit} budget`;
        } else if (notification.type.includes('SavingsGoalReached')) {
            const data = notification.data;
            return `You have reached ${data.percent}% of your ${data.goal_name} goal`;
        }
        return notification.data?.message || "New notification";
    };

    const handleNotificationClick = (notification) => {
        if (notification.type.includes('BudgetThresholdReached')) {
            navigate('/dashboard/budgets'); // Fixed: Added /dashboard prefix
        } else if (notification.type.includes('SavingsGoalReached')) {
            navigate('/dashboard/goals'); // Fixed: Added /dashboard prefix
        }
        setNotificationsOpen(false);
    };

    const markAsRead = (notificationId) => {
        // Here you would call an API to mark as read
        // For now, we'll just update the local state
        if (notificationsData?.notifications) {
            const updatedNotifications = notificationsData.notifications.map(notif => 
                notif.id === notificationId ? { ...notif, read_at: new Date().toISOString() } : notif
            );
            // Update your notifications data structure
            setUnreadCount(prev => prev > 0 ? prev - 1 : 0);
        }
    };

    const markAllAsRead = () => {
        // Here you would call an API to mark all as read
        setUnreadCount(0);
    };

    return (
        <>
            <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm min-h-20 relative">
                <div className="flex items-center justify-between">
                    {/* Menu Button */}
                    {mobileVP && <button
                        onClick={onMenuClick}
                        className="p-2 rounded-full hover:bg-slate-100"
                    >
                        <Menu className="w-5 h-5 text-slate-700" />
                    </button>}

                    {/* Left: Title */}
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">{pageTitle()}</h2>
                        <p className="text-sm text-slate-500">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    {/* Right: Controls */}
                    {!mobileVP ? (
                        <div className="flex items-center gap-4">
                            {/* Buttons */}
                            <button
                                onClick={() => setTransactionModal(true)}
                                className="flex items-center gap-2 bg-button text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-hover-button transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Transaction
                            </button>

                            <button
                                className="flex items-center gap-2 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                onClick={() => setExportModal(true)}
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            {/* Notifications Bell with Panel */}
                            <div className="relative">
                                <button 
                                    className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                >
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>

                                {/* Notifications Panel */}
                                <AnimatePresence>
                                    {notificationsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
                                        >
                                            {/* Panel Header */}
                                            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                                                    <p className="text-xs text-slate-500">
                                                        {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                                                        >
                                                            Mark all as read
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setNotificationsOpen(false)}
                                                        className="p-1 hover:bg-slate-200 rounded"
                                                    >
                                                        <X className="w-4 h-4 text-slate-500" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Notifications List */}
                                            <div className="max-h-96 overflow-y-auto">
                                                {notificationsData?.notifications?.length > 0 ? (
                                                    notificationsData.notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            onClick={() => {
                                                                handleNotificationClick(notification);
                                                                markAsRead(notification.id);
                                                            }}
                                                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                                                                !notification.read_at ? 'bg-blue-50/50' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className="mt-0.5">
                                                                    {getNotificationIcon(notification.type)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="font-medium text-slate-900 text-sm">
                                                                            {getNotificationTitle(notification.type)}
                                                                        </h4>
                                                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                                                            {formatTimeAgo(notification.created_at)}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-600 mt-1">
                                                                        {formatMessage(notification)}
                                                                    </p>
                                                                    {/* Additional details */}
                                                                    {notification.data && (
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {notification.data.type === 'budget' && notification.data.category && (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                                                    {notification.data.category}
                                                                                </span>
                                                                            )}
                                                                            {notification.data.percent && (
                                                                                <span className={`inline-flex items-center gap-1 px-2 py-1 ${
                                                                                    notification.data.percent >= 100 
                                                                                        ? 'bg-red-100 text-red-700' 
                                                                                        : notification.data.percent >= 80
                                                                                        ? 'bg-amber-100 text-amber-700'
                                                                                        : 'bg-green-100 text-green-700'
                                                                                } text-xs rounded-full`}>
                                                                                    {notification.data.percent}% reached
                                                                                </span>
                                                                            )}
                                                                            {notification.data.limit && (
                                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                                                                    <DollarSign className="w-3 h-3" />
                                                                                    {notification.data.limit}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {!notification.read_at && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-8 text-center">
                                                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                        <p className="text-slate-500">No notifications</p>
                                                        <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Panel Footer - Removed "View all notifications" since we don't have that route */}
                                            <div className="p-3 border-t border-slate-200 bg-slate-50">
                                                <button
                                                    onClick={() => navigate('/dashboard')} // Navigate to dashboard instead
                                                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    Go to Dashboard
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {/* Search Icon */}
                            <button className="p-2 rounded-full hover:bg-slate-100">
                                <Search className="w-5 h-5 text-slate-600" />
                            </button>

                            {/* Add Button */}
                            <button
                                onClick={() => setTransactionModal(true)}
                                className="flex items-center gap-1 bg-emerald-500 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>

                            {/* Notifications Bell for mobile */}
                            <div className="relative">
                                <button 
                                    className="p-2 rounded-full hover:bg-slate-100"
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                >
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                    )}
                                </button>
                            </div>

                            {/* Menu Button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="p-2 rounded-full hover:bg-slate-100"
                            >
                                <Menu className="w-5 h-5 text-slate-700" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileVP && menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3"
                        >
                            <button 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition"
                                onClick={() => {
                                    setExportModal(true);
                                    setMenuOpen(false);
                                }}
                            >
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <button 
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition"
                                onClick={() => {
                                    setNotificationsOpen(true);
                                    setMenuOpen(false);
                                }}
                            >
                                <Bell className="w-4 h-4 text-slate-600" />
                                Notifications {unreadCount > 0 && `(${unreadCount})`}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mobile Notifications Panel */}
                <AnimatePresence>
                    {mobileVP && notificationsOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-white z-50 flex flex-col"
                        >
                            {/* Mobile Panel Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                                <h3 className="font-semibold text-slate-900 text-lg">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 hover:bg-blue-50 rounded"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setNotificationsOpen(false)}
                                        className="p-2 hover:bg-slate-100 rounded-full"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Notifications List */}
                            <div className="flex-1 overflow-y-auto">
                                {notificationsData?.notifications?.length > 0 ? (
                                    notificationsData.notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => {
                                                handleNotificationClick(notification);
                                                markAsRead(notification.id);
                                            }}
                                            className={`p-4 border-b border-slate-100 active:bg-slate-50 ${
                                                !notification.read_at ? 'bg-blue-50/50' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-slate-900">
                                                            {getNotificationTitle(notification.type)}
                                                        </h4>
                                                        <span className="text-xs text-slate-500 whitespace-nowrap">
                                                            {formatTimeAgo(notification.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 mt-1">
                                                        {formatMessage(notification)}
                                                    </p>
                                                    {/* Additional details */}
                                                    {notification.data && (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {notification.data.type === 'budget' && notification.data.category && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                                    {notification.data.category}
                                                                </span>
                                                            )}
                                                            {notification.data.percent && (
                                                                <span className={`inline-flex items-center gap-1 px-2 py-1 ${
                                                                    notification.data.percent >= 100 
                                                                        ? 'bg-red-100 text-red-700' 
                                                                        : notification.data.percent >= 80
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-green-100 text-green-700'
                                                                } text-xs rounded-full`}>
                                                                    {notification.data.percent}% reached
                                                                </span>
                                                            )}
                                                            {notification.data.limit && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                                                                    <DollarSign className="w-3 h-3" />
                                                                    {notification.data.limit}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {!notification.read_at && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 text-lg">No notifications</p>
                                        <p className="text-slate-400 mt-1">You're all caught up!</p>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Panel Footer */}
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <button
                                    onClick={() => {
                                        navigate('/dashboard'); // Navigate to dashboard instead
                                        setNotificationsOpen(false);
                                    }}
                                    className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-3 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={transactionModal}
                onClose={() => setTransactionModal(false)}
            />
            {/* Export Modal */}
            <ExportModal
                isOpen={exportModal}
                onClose={() => setExportModal(false)}
            />
        </>
    );
}