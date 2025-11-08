import { Bell, Search, Download, Plus, Menu } from "lucide-react";
import { useState } from "react";
import TransactionModal from "../modal/TransactionModal";
import { useMediaQuery } from "react-responsive";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

export default function Header({ onMenuClick }) {

    const location = useLocation();
    const navigate = useNavigate();
    const [transactionModal, setTransactionModal] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const pageTitle = () => {
        const path = location.pathname.toLowerCase();

        if (path.includes("/transactions")) return "Transaction";
        if (path.includes("/budgets")) return "Budget";
        if (path.includes("/goals")) return "Savings Goal";
        if (path.includes("/accounts")) return "Accounts";
        return "Dashboard";
    }
    return (
        <>
            <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
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
                        <p className="text-sm text-slate-500">Monday, October 20, 2025</p>
                    </div>

                    {/* Right: Controls */}
                    {!mobileVP ? (
                        <div className="flex items-center gap-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search transactions..."
                                    className="pl-9 pr-3 py-2 w-64 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition-all"
                                />
                            </div>

                            {/* Buttons */}
                            <button
                                onClick={() => setTransactionModal(true)}
                                className="flex items-center gap-2 bg-button text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-hover-button transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Transaction
                            </button>

                            <button className="flex items-center gap-2 border border-slate-300 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <Bell className="w-5 h-5 text-slate-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
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
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition">
                                <Download className="w-4 h-4" /> Export
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md transition">
                                <Bell className="w-4 h-4 text-slate-600" />
                                Notifications
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Transaction Modal */}
            <TransactionModal
                isOpen={transactionModal}
                onClose={() => setTransactionModal(false)}
            />
        </>
    );
}
