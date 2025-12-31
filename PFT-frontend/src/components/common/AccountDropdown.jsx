import { useAccount } from "../../hooks/account";
import { Wallet } from "lucide-react";

export default function AccountDropdown({ selectedId, onSelect, disabled = false, size = "medium" }) {
    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];

    const sizeClasses = {
        small: "text-sm pl-9 pr-3 py-2",
        medium: "text-base pl-10 pr-4 py-3",
    };

    const iconSize = {
        small: "w-3.5 h-3.5",
        medium: "w-4 h-4",
    };

    const selectedAccount = accounts.find(acc => acc.id.toString() === selectedId?.toString());

    return (
        <div className="relative w-full">
            <Wallet className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconSize[size]} text-gray-400`} />
            <select
                value={selectedId}
                onChange={(e) => onSelect(e.target.value)}
                disabled={disabled || accounts.length === 0}
                className={`w-full border border-gray-300 rounded-lg bg-white text-gray-900 
                         focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none 
                         transition-colors duration-150 ${sizeClasses[size]}
                         ${disabled || accounts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <option value="">
                    {accounts.length === 0 ? "No accounts available" : "Select account"}
                </option>
                {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                        {account.account_name}
                    </option>
                ))}
            </select>
            {selectedAccount && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className={`w-2 h-2 rounded-full ${selectedAccount.type === 'Income' ? 'bg-income' : 'bg-expense'}`} />
                </div>
            )}
        </div>
    );
}