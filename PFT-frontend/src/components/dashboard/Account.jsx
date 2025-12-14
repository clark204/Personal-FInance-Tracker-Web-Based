import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Edit, Plus, Trash2, SquarePen } from "lucide-react";
import AccountModal from "../modal/AccountModal";
import { useAccount } from "../../hooks/account";
import EditAccountModal from "../modal/EditAccountModal";
import { Bounce, toast } from "react-toastify";
import ConfirmModal from "../modal/confirmModal";

export default function Account() {
    const { getAccounts, deleteAccount } = useAccount();

    const accounts = getAccounts.data?.account || [];

    const mobileVP = useMediaQuery({ maxWidth: 768 });

    const [accountModal, setAccountModal] = useState(false);
    const [editAccount, setEditAccount] = useState(false);
    const [accountID, setAccountID] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    return (
        <div className="h-screen p-6 md:p-8 bg-linear-to-b from-primary-gradient to-secondary-gradient overflow-auto text-color-text">
            {/* Total Balance Section */}
            <div className="bg-main-light text-white rounded-2xl p-6 md:p-10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <p className="text-sm text-gray-300">Total Balance</p>
                    <p className="text-4xl md:text-5xl font-semibold mt-1">$25,770.5</p>
                    <p className="text-sm text-gray-400 mt-1">Across 4 accounts</p>
                </div>
                <button onClick={() => {
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
                    {accounts.length > 0 ? (
                        accounts.map((account) => (
                            <div key={account.id} className="">
                                <div className="bg-income text-white p-6 flex justify-between items-start">
                                    <div>
                                        <p className="text-sm opacity-80">{account.type}</p>
                                        <h3 className="text-xl font-semibold">{account.account_name}</h3>
                                        <p className="text-3xl font-bold mt-2">{account.balance}</p>
                                        <p className="text-sm opacity-80">{account.currency.code}</p>
                                    </div>
                                    <div className="bg-white bg-opacity-20 p-2 rounded-full text-black cursor-pointer"
                                        onClick={() => {
                                            setEditAccount(true);
                                            setAccountID(account.id);
                                        }}>
                                        <SquarePen size={20} strokeWidth={2} />
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

                                    <button
                                        onClick={() => {
                                            setSelectedAccount(account);
                                            setShowConfirm(true);
                                        }}
                                        className="mt-4 flex items-center justify-center w-full border border-red-500 text-red-600 py-2 rounded-md hover:bg-red-50 transition">
                                        <Trash2 size={16} className="mr-2" /> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p></p>
                    )}
                </div>
            </div>

            <AccountModal isOpen={accountModal} onClose={() => { setAccountModal(false) }} />
            <EditAccountModal isOpen={editAccount} onClose={() => { setEditAccount(false) }} ID={accountID} />
            <ConfirmModal
                show={showConfirm}
                text={`Are you sure you want to delete "${selectedAccount?.account_name}"?`}
                onClose={() => setShowConfirm(false)}
                onSubmit={() => {
                    if (!selectedAccount) return;

                    deleteAccount.mutate(selectedAccount.id, {
                        onSuccess: () => {
                            toast.success(`Deleted successfully! ${selectedAccount.account_name}`, {
                                position: "bottom-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                progress: undefined,
                                theme: "light",
                                transition: Bounce,
                            });
                            setShowConfirm(false);
                            setSelectedAccount(null);
                        },
                    });
                }}
            />
        </div>
    );
}
