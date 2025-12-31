import { useEffect, useState, useRef } from "react";
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
    User,
    ArrowRightLeft,
    Home,
    PieChart,
    Wallet,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../common/confirmModal";
import { useAccount } from "../../hooks/account";

export default function Sidebar({ onClose }) {
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const profileMenuRef = useRef(null);
    const accountMenuRef = useRef(null);
    const location = useLocation();

    // User
    const { user } = useAuth();
    const { getAccounts } = useAccount();
    const accounts = getAccounts.data?.account || [];

    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const [confirmModal, setConfirmModal] = useState(false);
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [hoverBalance, setHoverBalance] = useState(false);

    const selectedAccount = accounts.find(
        acc => acc.id === selectedAccountId
    );

    useEffect(() => {
        if (accounts.length > 0 && selectedAccountId === null) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts, selectedAccountId]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setProfileMenuOpen(false);
            }
            if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
                setAccountMenuOpen(false);
                setShowBalance(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        setConfirmModal(false);
    }

    const menuSections = [
        {
            label: "Overview",
            items: [
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
            ],
        },
        {
            label: "Financial Management",
            items: [
                { id: "transactions", label: "Transactions", icon: Receipt, path: "/dashboard/transactions" },
                { id: "budgets", label: "Budgets", icon: TrendingUp, path: "/dashboard/budgets" },
                { id: "goals", label: "Savings Goals", icon: Target, path: "/dashboard/goals" },
            ],
        },
        {
            label: "Settings",
            items: [
                { id: "accounts", label: "Accounts", icon: Settings, path: "/dashboard/accounts" },
            ],
        },
    ];

    return (
        <motion.aside
            layout
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="h-screen bg-main text-white flex flex-col border-r border-slate-700 relative z-40"
        >
            {/* Close button for mobile */}
            {mobileVP && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-slate-700/50 rounded-md transition-colors duration-150 z-50"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex items-center justify-between h-20">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {!isCollapsed && (
                        <>
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-md shadow-lg shadow-emerald-500/20 flex items-center justify-center shrink-0">
                                <Home className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-emerald-300 text- font-bold tracking-wide truncate">
                                    Finance<span className="text-emerald-500">Tracker</span>
                                </h1>
                                <p className="text-xs text-slate-400 truncate">Personal Finance</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Collapse toggle - Always visible (except on mobile) */}
                {!mobileVP && (
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-md hover:bg-slate-700 transition-colors duration-300 shrink-0 ml-2"
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.div
                            animate={{ rotate: isCollapsed ? 180 : 0 }}
                            transition={{ duration: 0.3, type: "spring" }}
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-300" />
                        </motion.div>
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {menuSections.map((section) => (
                    <div key={section.label}>
                        {/* Section Label - Only show when not collapsed */}
                        {!isCollapsed && (
                            <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {section.label}
                            </p>
                        )}

                        {/* Section Items */}
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <div key={item.id} className="relative group">
                                        <button
                                            onClick={() => {
                                                navigate(item.path);
                                                if (mobileVP && onClose) onClose();
                                            }}
                                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                                ? "bg-emerald-900/30 text-emerald-300 border-l-4 border-emerald-500"
                                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                                            {!isCollapsed && (
                                                <span className="truncate">{item.label}</span>
                                            )}
                                        </button>

                                        {/* Tooltip when collapsed */}
                                        {isCollapsed && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 pointer-events-none">
                                                <div className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                                                    {item.label}
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-slate-800"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <motion.div layout className="p-4 border-t border-slate-700 space-y-3 relative">

                {/* Account Selector */}
                <div ref={accountMenuRef} className="relative">
                    {!isCollapsed ? (
                        /* EXPANDED SIDEBAR */
                        <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-emerald-900/30 flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">
                                            {selectedAccount?.account_name || "Select Account"}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate">
                                            {selectedAccount?.account_type || "Account"}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                                    className="p-1.5 hover:bg-slate-700/50 rounded-lg transition"
                                >
                                    <ArrowRightLeft className="w-4 h-4 text-slate-300 hover:text-emerald-400" />
                                </button>
                            </div>

                            <p className="text-2xl font-bold text-white truncate">
                                {selectedAccount?.currency?.symbol}
                                {parseFloat(selectedAccount?.balance || 0).toFixed(2)}
                            </p>

                            {/* Dropdown */}
                            <AnimatePresence>
                                {accountMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        className="absolute bottom-full left-0 mb-2 w-full bg-slate-900
                                       border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
                                    >
                                        <div className="px-3 py-2 bg-slate-800/50 border-b border-slate-700">
                                            <p className="text-xs font-semibold text-slate-400">
                                                SELECT ACCOUNT
                                            </p>
                                        </div>

                                        {accounts.map(account => (
                                            <button
                                                key={account.id}
                                                onClick={() => {
                                                    setSelectedAccountId(account.id);
                                                    setAccountMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 text-sm
                                        hover:bg-slate-800 transition
                                        flex items-center justify-between
                                        ${selectedAccount?.id === account.id
                                                        ? "bg-slate-800 text-emerald-300"
                                                        : "text-white"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                        <CreditCard className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <span className="block truncate font-medium">
                                                            {account.account_name}
                                                        </span>
                                                        <span className="text-xs text-slate-400 truncate">
                                                            {account.account_type}
                                                        </span>
                                                    </div>
                                                </div>

                                                <span className="text-sm font-semibold text-slate-300">
                                                    {account.currency?.symbol}
                                                    {parseFloat(account.balance || 0).toFixed(2)}
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* COLLAPSED SIDEBAR */
                        <div className="flex items-center justify-center">
                            <div className="relative">
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    onMouseEnter={() => setHoverBalance(true)}
                                    onMouseLeave={() => setHoverBalance(false)}
                                    className="p-2.5 rounded-lg hover:bg-slate-700/50
                                   transition-all group"
                                >
                                    <CreditCard className="w-6 h-6 text-emerald-400
                                               group-hover:text-emerald-300 transition" />
                                </button>

                                {/* Hover popup (RIGHT SIDE) */}
                                <AnimatePresence>
                                    {(showBalance || hoverBalance) && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, x: -6 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, x: -6 }}
                                            className="absolute left-full top-1/2
                                           -translate-y-1/2 ml-3
                                           bg-slate-900 border border-slate-700
                                           rounded-xl shadow-xl z-50
                                           p-4 min-w-[200px]"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-900/30
                                                    flex items-center justify-center">
                                                    <CreditCard className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-white truncate">
                                                        {selectedAccount?.account_name || "No Account"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 truncate">
                                                        {selectedAccount?.account_type || "Select an account"}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-2xl font-bold text-white mb-1">
                                                {selectedAccount?.currency?.symbol}
                                                {parseFloat(selectedAccount?.balance || 0).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                Current Balance
                                            </p>

                                            {/* Arrow */}
                                            <div className="absolute top-1/2 -left-2 -translate-y-1/2
                                                border-4 border-transparent
                                                border-r-slate-900" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Menu */}
                <div ref={profileMenuRef} className="relative">
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className={`flex items-center gap-3 w-full ${isCollapsed ? "h-10" : "px-4 py-3"} text-sm hover:bg-slate-800 bg-slate-800/50
                                    rounded-xl transition`}
                    >
                        <div className={`${isCollapsed ? "w-full h-full" : "w-9 h-9"} bg-gradient-to-br from-emerald-600 to-emerald-800
                            rounded-full flex items-center justify-center`}>
                            <User className="w-4 h-4 text-white" />
                        </div>

                        {!isCollapsed && (
                            <div className="text-left min-w-0 flex-1">
                                <span className="block truncate text-white font-medium">
                                    {user?.name || "User"}
                                </span>
                                <span className="text-xs text-slate-400 truncate">
                                    {user?.email || ""}
                                </span>
                            </div>
                        )}
                    </button>

                    <AnimatePresence>
                        {profileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className={`absolute bottom-full mb-2
                        ${isCollapsed ? "left-full ml-2" : "left-0"}
                        w-56 bg-slate-900 border border-slate-700
                        rounded-xl shadow-xl z-50 overflow-hidden`}
                            >
                                <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {user?.name || "User"}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {user?.email || ""}
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        navigate("/dashboard/profile");
                                        setProfileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm
                                   hover:bg-slate-800 text-white flex gap-3"
                                >
                                    <User className="w-4 h-4 text-slate-400" />
                                    Profile
                                </button>

                                <button
                                    onClick={() => {
                                        navigate("/dashboard/settings");
                                        setProfileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm
                                   hover:bg-slate-800 text-white flex gap-3"
                                >
                                    <Settings className="w-4 h-4 text-slate-400" />
                                    Settings
                                </button>

                                <div className="border-t border-slate-700">
                                    <button
                                        onClick={() => {
                                            setConfirmModal(true);
                                            setProfileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm
                                       text-red-400 hover:bg-red-900/20
                                       flex gap-3"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>


            <ConfirmModal
                show={confirmModal}
                text="Are you sure you want to logout?"
                onSubmit={handleLogout}
                onClose={() => setConfirmModal(false)}
                type="warning"
                confirmText="Logout"
                destructive={true}
            />
        </motion.aside>
    );
}