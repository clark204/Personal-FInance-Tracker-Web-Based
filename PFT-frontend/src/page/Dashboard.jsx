import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { useMediaQuery } from "react-responsive";
import { AnimatePresence, motion } from "framer-motion";

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const mobileVP = useMediaQuery({ maxWidth: 768 });

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar */}
            {!mobileVP ? (
                <Sidebar />
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
                            <Sidebar onClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <Outlet />
            </div>
        </div>
    );
}

export default Dashboard;
