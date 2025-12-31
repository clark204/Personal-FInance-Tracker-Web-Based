import { useAccount } from "../../hooks/account";

export default function AccountFilter({ selectedAccount, onSelect }) {
    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];

    return (
        <div className="flex flex-col relative">
            <select
                value={selectedAccount || ""}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
                <option value="">All account</option>
                {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                        {account.account_name}
                    </option>
                ))}
            </select>
        </div>
    );
}