import { useState } from "react";
import {
    LayoutDashboard,
    CreditCard,
    TrendingUp,
    Target,
    Receipt,
    Settings,
    ChevronLeft,
    X,
    LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { id: "transactions", label: "Transactions", icon: Receipt, path: "/dashboard/transactions" },
        { id: "budgets", label: "Budgets", icon: TrendingUp, path: "/dashboard/budgets" },
        { id: "goals", label: "Savings Goals", icon: Target, path: "/dashboard/goals" },
        { id: "accounts", label: "Accounts", icon: Settings, path: "/dashboard/accounts" },
        { id: "settings", label: "Settings", icon: Settings, path: "/dashboard/settings" },
    ];

    return (
        <motion.aside
            layout
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="h-screen bg-[#0B2027] text-white flex flex-col border-r border-slate-700 relative"
        >
            {/* Close button for mobile */}
            {mobileVP && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[url('/FT.svg')] bg-cover bg-center rounded-md shadow-md shadow-emerald-500/20"></div>
                        <div>
                            <h1 className="text-emerald-300 text-xl font-semibold tracking-wide">
                                Finance<span className="text-emerald-500">Tracker</span>
                            </h1>
                            <p className="text-xs text-slate-400">Personal Wallet</p>
                        </div>
                    </div>
                )}

                {/* Collapse toggle */}
                {!mobileVP && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-md hover:bg-slate-700 transition-colors duration-300"
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-300" />
                        </motion.div>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 relative">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => {
                                    navigate(item.path);
                                    if (mobileVP && onClose) onClose();
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-text-secondary rounded-md hover:bg-slate-700 hover:text-white transition-colors duration-150"
                            >
                                <Icon className="w-5 h-5 text-icon flex-shrink-0" />
                                {!isCollapsed && (
                                    <motion.span
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </button>

                            {/* Tooltip when collapsed */}
                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                    <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                        {item.label}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <motion.div layout className="p-4 border-t border-main-light space-y-3">
                {!isCollapsed ? (
                    <div className="bg-main-light/50 rounded-lg p-4">
                        <p className="text-xs text-text-secondary mb-2">Total Balance</p>
                        <p className="text-2xl font-semibold text-white">$25,770.50</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-balance" />
                    </div>
                )}

                {/* Logout */}
                <button
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-[var(--color-expense)] hover:text-white hover:bg-[var(--color-expense)]/20 rounded-md transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </motion.div>
        </motion.aside>
    );
}
