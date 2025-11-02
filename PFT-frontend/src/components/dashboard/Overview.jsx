import { Wallet } from "lucide-react";
import IncomeExpenseChart from "../overview/IncomeExpenseChart";
import SpendingCategoryChart from "../overview/SpendingCategoryChart";
import BudgetOverview from "../overview/BudgetOverview";
import GoalOverview from "../overview/GoalOverview";
import RecentTransactions from "../overview/RecentTransaction";

export default function Overview() {
    return (
        <div className="h-screen bg-gray-50 overflow-auto">
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <IncomeExpenseChart />
                    <SpendingCategoryChart />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <BudgetOverview />
                    <GoalOverview />
                </div>

                <div className="mb-6">
                    <RecentTransactions />
                </div>
            </main>
        </div>
    );
}