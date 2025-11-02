import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Plus, Trash2 } from "lucide-react";
import AccountModal from "../modal/AccountModal";

export default function Account() {
    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const [accountModal, setAccountModal] = useState(false);

    return (
        <div className="h-screen p-6 md:p-8 bg-gradient-to-b from-primary-gradient to-secondary-gradient overflow-auto text-color-text">
            {/* Total Balance Section */}
            <div className="bg-main-light text-white rounded-2xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <p className="text-sm text-gray-300">Total Balance</p>
                    <p className="text-4xl md:text-5xl font-semibold mt-1">$25,770.5</p>
                    <p className="text-sm text-gray-400 mt-1">Across 4 accounts</p>
                </div>
                <button onClick={()=>{
                    setAccountModal(true);
                }} className="mt-4 md:mt-0 bg-button text-white px-4 py-2 rounded-md hover:bg-hover-button transition flex items-center space-x-2">
                    <Plus size={18} /> <span>Add Account</span>
                </button>
            </div>

            {/* My Accounts */}
            <h2 className="text-lg font-medium text-main mb-4">My Accounts</h2>

            {/* Account Cards Container */}
            <div
                className={`grid gap-6 ${mobileVP ? "grid-cols-1" : "grid-cols-2"
                    } transition-all`}
            >
                {/* Account Card - Main Wallet */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="bg-income text-white p-6 flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-80">Cash</p>
                            <h3 className="text-xl font-semibold">Main Wallet</h3>
                            <p className="text-3xl font-bold mt-2">$5,420.5</p>
                            <p className="text-sm opacity-80">USD</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm text-color-text-secondary">Recent Activity</p>
                            <p className="text-xs border px-2 py-1 rounded-full text-gray-500">
                                3 transactions
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Grocery Shopping</p>
                                    <p className="text-sm text-color-text-secondary">Food & Dining</p>
                                </div>
                                <p className="text-expense font-medium">-$125.50</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Gas Station</p>
                                    <p className="text-sm text-color-text-secondary">Transportation</p>
                                </div>
                                <p className="text-expense font-medium">-$45.00</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Coffee Shop</p>
                                    <p className="text-sm text-color-text-secondary">Food & Dining</p>
                                </div>
                                <p className="text-expense font-medium">-$8.50</p>
                            </div>
                        </div>

                        <button className="mt-4 flex items-center justify-center w-full border border-red-500 text-red-600 py-2 rounded-md hover:bg-red-50 transition">
                            <Trash2 size={16} className="mr-2" /> Delete
                        </button>
                    </div>
                </div>

                {/* Account Card - Visa Card */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="bg-balance text-white p-6 flex justify-between items-start">
                        <div>
                            <p className="text-sm opacity-80">Credit Card</p>
                            <h3 className="text-xl font-semibold">Visa Card</h3>
                            <p className="text-3xl font-bold mt-2">$2,150</p>
                            <p className="text-sm opacity-80">USD</p>
                        </div>
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M3 14h18M9 10v4"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-sm text-color-text-secondary">Recent Activity</p>
                            <p className="text-xs border px-2 py-1 rounded-full text-gray-500">
                                3 transactions
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Netflix Subscription</p>
                                    <p className="text-sm text-color-text-secondary">Entertainment</p>
                                </div>
                                <p className="text-expense font-medium">-$15.99</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Electric Bill</p>
                                    <p className="text-sm text-color-text-secondary">Bills & Utilities</p>
                                </div>
                                <p className="text-expense font-medium">-$120.00</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">Online Shopping</p>
                                    <p className="text-sm text-color-text-secondary">Shopping</p>
                                </div>
                                <p className="text-expense font-medium">-$250.00</p>
                            </div>
                        </div>

                        <button className="mt-4 flex items-center justify-center w-full border border-red-500 text-red-600 py-2 rounded-md hover:bg-red-50 transition">
                            <Trash2 size={16} className="mr-2" /> Delete
                        </button>
                    </div>
                </div>
            </div>

            <AccountModal isOpen={accountModal} onClose={()=>{setAccountModal(false)}} />
        </div>
    );
}
