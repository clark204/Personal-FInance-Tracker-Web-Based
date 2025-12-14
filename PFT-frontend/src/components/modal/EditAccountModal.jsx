import { X } from "lucide-react";
import { useAccount } from "../../hooks/account";
import { useState, useEffect } from "react";
import { Bounce, toast } from "react-toastify";

export default function EditAccountModal({ isOpen, onClose, ID }) {
    const { showAccount, updateAccount } = useAccount(ID);
    const account = showAccount.data?.data;

    const [formData, setFormData] = useState({
        account_name: "",
        type: "",
    });

    useEffect(() => {
        if (account) {
            setFormData({
                account_name: account.account_name || "",
                type: account.type || "",
            });
        }
    }, [account]);

    if (!isOpen || !account) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const updateData = {
            id: ID,
            account_name: formData.account_name,
            type: formData.type,
        };

        updateAccount.mutate(updateData, {
            onSuccess: () => {
                toast.success('Updated successfully!', {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    progress: undefined,
                    theme: "light",
                    transition: Bounce,
                });
                onClose();
            }
        })
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
                    aria-label="Close edit account modal"
                >
                    <X className="w-5 h-5 text-text" />
                </button>

                {/* Header */}
                <h2 className="text-xl font-semibold text-text">Edit Account</h2>
                <p className="text-sm text-text-secondary mb-6">
                    Update your account details
                </p>

                {/* Form */}
                <form className="space-y-4" method="POST" onSubmit={handleSubmit}>
                    {/* Account Name */}
                    <div>
                        <label
                            htmlFor="account_name"
                            className="block text-sm font-medium text-text/70"
                        >
                            Account Name
                        </label>
                        <input
                            id="account_name"
                            name="account_name"
                            type="text"
                            value={formData.account_name}
                            onChange={handleChange}
                            autoComplete="account-name"
                            className="w-full border border-border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-focus"
                            placeholder="Enter account name"
                        />
                    </div>

                    {/* Account Type */}
                    <div>
                        <label
                            htmlFor="type"
                            className="block text-sm font-medium text-text/70"
                        >
                            Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            autoComplete="account-type"
                            className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-focus outline-none"
                        >
                            <option value="">Select Type</option>
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    {/* Currency (Disabled) */}
                    <div>
                        <label
                            htmlFor="currency"
                            className="block text-sm font-medium text-text/70"
                        >
                            Currency
                        </label>
                        <select
                            id="currency"
                            name="currency"
                            value={account.currency?.id}
                            disabled
                            className="w-full border border-border rounded-md p-2 text-text bg-gray-200 cursor-not-allowed"
                        >
                            <option>{account.currency?.code || "Loading..."}</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-border text-text hover:bg-text-secondary transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateAccount.isLoading}
                            className="px-4 py-2 rounded-lg bg-button text-white font-medium hover:bg-hover-button transition"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
