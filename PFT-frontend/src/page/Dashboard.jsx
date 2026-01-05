import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { useMediaQuery } from "react-responsive";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount } from "../hooks/account";
import { useOverviewFilter } from "../hooks/overviewFilter";
import api from "../api/api";
import LoadingScreen from "./LoadingScreen"; // Import LoadingScreen

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [hasAccounts, setHasAccounts] = useState(null);
    const [checkingAccounts, setCheckingAccounts] = useState(true);
    
    const mobileVP = useMediaQuery({ maxWidth: 768 });
    const navigate = useNavigate();
    const location = useLocation();

    const overviewFilter = useOverviewFilter({
        selectedAccount: selectedAccountId,
    });

    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];

    // Check if user has accounts on mount
    useEffect(() => {
        const checkUserAccounts = async () => {
            try {
                const response = await api.get('/accounts');
                const accounts = response.data?.data || response.data?.account || response.data;
                
                let accountArray = [];
                if (Array.isArray(accounts)) {
                    accountArray = accounts;
                } else if (accounts?.account && Array.isArray(accounts.account)) {
                    accountArray = accounts.account;
                }
                
                const userHasAccounts = accountArray.length > 0;
                setHasAccounts(userHasAccounts);
                
                // If user has no accounts and not on create-account page, redirect
                if (!userHasAccounts && location.pathname !== '/dashboard/create-account') {
                    navigate('/dashboard/create-account');
                }
                
                // Set first account as selected if available
                if (accountArray.length > 0 && !selectedAccountId) {
                    setSelectedAccountId(accountArray[0].id);
                }
            } catch (error) {
                console.error('Error checking accounts:', error);
                setHasAccounts(false);
                // Redirect to create-account if we can't check accounts
                if (location.pathname !== '/dashboard/create-account') {
                    navigate('/dashboard/create-account');
                }
            } finally {
                setCheckingAccounts(false);
            }
        };

        checkUserAccounts();
    }, [location.pathname, navigate, selectedAccountId]);

    // Initialize with first account if none selected (from hook data)
    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id);
        }
    }, [accounts, selectedAccountId]);

    // Handle account change from sidebar
    const handleAccountChange = (accountId) => {
        setSelectedAccountId(accountId);
    };

    // Show loading while checking accounts
    if (checkingAccounts) {
        return <LoadingScreen message="Loading your dashboard..." />;
    }

    // If user has no accounts and not on create-account page, don't show dashboard
    if (hasAccounts === false && location.pathname !== '/dashboard/create-account') {
        return null; // Will be redirected by useEffect
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Don't show sidebar on create-account page */}
            {location.pathname !== '/dashboard/create-account' && (
                <>
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
                </>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Don't show header on create-account page */}
                {location.pathname !== '/dashboard/create-account' && (
                    <Header
                        onMenuClick={() => setSidebarOpen(true)}
                        selectedAccountId={selectedAccountId}
                    />
                )}
                
                <Outlet context={{ selectedAccountId, overviewFilter }} />
            </div>
        </div>
    );
}

export default Dashboard;