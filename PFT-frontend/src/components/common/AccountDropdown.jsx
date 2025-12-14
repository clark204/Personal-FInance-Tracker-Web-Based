import { useAccount } from "../../hooks/account";

export default function AccountDropdown({ selectedId, onSelect }) {
    const { getAccounts } = useAccount();
    const accounts = getAccounts?.data?.account || [];
    return (
        <select
            value={selectedId}
            onChange={(e) => onSelect(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-focus"
        >
            <option value="">Select account</option>
            {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                    {account.account_name}
                </option>
            ))}
        </select>
    );
}