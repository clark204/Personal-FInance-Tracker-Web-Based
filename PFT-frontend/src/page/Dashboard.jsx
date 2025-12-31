// pages/Dashboard.js
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { useMediaQuery } from "react-responsive";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "../hooks/account";
import { useOverviewFilter } from "../hooks/overviewFilter";

function Dashboard() {

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const overviewFilter = useOverviewFilter({
        selectedAccount: selectedAccountId,
    });

    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];

    // Initialize with first account if none selected
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts, selectedAccountId]);

    // Handle account change from sidebar
    const handleAccountChange = (accountId) => {
        setSelectedAccountId(accountId);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar */}
            {!mobileVP ? (
                <Sidebar
                    onAccountChange={handleAccountChange}
                    selectedAccountId={selectedAccountId}
                />
            ) : (
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            key="mobile-sidebar"
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="fixed inset-y-0 left-0 z-50"
                        >
                            <Sidebar
                                onClose={() => setSidebarOpen(false)}
                                onAccountChange={handleAccountChange}
                                selectedAccountId={selectedAccountId}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setSidebarOpen(true)}
                    selectedAccountId={selectedAccountId}
                />
                <Outlet context={{ selectedAccountId, overviewFilter }} />
            </div>
        </div>
    );
}

export default Dashboard;