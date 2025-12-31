import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useAccount } from "../../hooks/account";
import { LineChart } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function IncomeExpenseChart({ filters }) {
    const { showAccount } = useAccount(filters.account_id);
    
    // Get account data which includes transactions
    const accountInfo = showAccount.data?.data;
    const transactions = accountInfo?.transactions || [];
    
    const { date_from: dateFrom, date_to: dateTo, datePreset } = filters;

    // Filter transactions based on date range
    const filteredTransactions = useMemo(() => {
        const from = dateFrom ? new Date(dateFrom) : null;
        const to = dateTo ? new Date(dateTo) : null;

        return transactions.filter((item) => {
            const itemDate = new Date(item.transaction_date || item.date);
            if (from && to) return itemDate >= from && itemDate <= to;
            if (from) return itemDate >= from;
            if (to) return itemDate <= to;
            return true;
        });
    }, [transactions, dateFrom, dateTo]);

    // Extract currency symbol from account info
    const currencySymbol = useMemo(() => {
        // Get from account info (always available when account is loaded)
        if (accountInfo?.currency?.symbol) {
            return accountInfo.currency.symbol;
        }
        
        // Fallback: from transactions (if any)
        if (filteredTransactions.length > 0) {
            const firstTransaction = filteredTransactions[0];
            if (firstTransaction?.account?.currency?.symbol) {
                return firstTransaction.account.currency.symbol;
            }
        }
        
        // Ultimate fallback
        return "$";
    }, [accountInfo, filteredTransactions]);

    // Determine grouping strategy based on filter period
    const groupingStrategy = useMemo(() => {
        const preset = datePreset || 'today';
        
        if (preset.includes('today') || preset.includes('week')) {
            return 'day'; // Today, This Week, Last Week → group by day
        } else if (preset.includes('month') || preset.includes('last_month')) {
            return 'week'; // This Month, Last Month → group by week
        } else if (preset.includes('year') || preset.includes('last_year')) {
            return 'month'; // This Year, Last Year → group by month
        } else if (preset === 'custom') {
            // For custom range, determine based on date range length
            if (dateFrom && dateTo) {
                const from = new Date(dateFrom);
                const to = new Date(dateTo);
                const diffDays = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 7) return 'day';
                if (diffDays <= 60) return 'week'; // ~2 months
                return 'month'; // More than 2 months
            }
            return 'day'; // Default for custom
        }
        return 'day'; // Default
    }, [datePreset, dateFrom, dateTo]);

    // Group transactions and create chart data
    const { chartData, tooltipDates, allGroups } = useMemo(() => {
        const incomeMap = {};
        const expenseMap = {};
        const dateMap = {}; // Store date info for tooltips
        
        filteredTransactions.forEach((item) => {
            const date = new Date(item.transaction_date || item.date);
            let groupKey, displayLabel, tooltipDate;
            
            switch (groupingStrategy) {
                case 'day':
                    // Group by day
                    groupKey = date.toISOString().split('T')[0];
                    displayLabel = date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    tooltipDate = date;
                    break;
                case 'week':
                    // Group by week
                    const year = date.getFullYear();
                    const week = getWeekNumber(date);
                    groupKey = `${year}-W${String(week).padStart(2, '0')}`;
                    
                    const weekStart = getDateOfISOWeek(week, year);
                    displayLabel = `Week ${week}`;
                    
                    // Store week range for tooltip
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekStart.getDate() + 6);
                    tooltipDate = { weekStart, weekEnd, weekNumber: week };
                    break;
                case 'month':
                default:
                    // Group by month
                    const monthYear = date.getFullYear();
                    const monthNum = date.getMonth() + 1;
                    groupKey = `${monthYear}-${String(monthNum).padStart(2, '0')}`;
                    
                    const monthDate = new Date(monthYear, monthNum - 1);
                    displayLabel = monthDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        year: 'numeric' 
                    });
                    tooltipDate = monthDate;
                    break;
            }
            
            const amount = parseFloat(item.amount) || 0;
            
            if (item.type === "Income") {
                incomeMap[groupKey] = (incomeMap[groupKey] || 0) + amount;
            } else if (item.type === "Expense") {
                expenseMap[groupKey] = (expenseMap[groupKey] || 0) + amount;
            }
            
            // Store display info for this group
            if (!dateMap[groupKey]) {
                dateMap[groupKey] = { displayLabel, tooltipDate };
            }
        });

        // Get all unique groups and sort them
        const groups = Array.from(new Set([
            ...Object.keys(incomeMap),
            ...Object.keys(expenseMap)
        ])).sort();

        // Create labels and data arrays
        const labels = groups.map(group => dateMap[group].displayLabel);
        const incomeData = groups.map(group => incomeMap[group] || 0);
        const expenseData = groups.map(group => expenseMap[group] || 0);
        
        // Store tooltip dates in same order
        const dates = groups.map(group => dateMap[group].tooltipDate);

        return {
            chartData: {
                labels,
                datasets: [
                    {
                        label: "Income",
                        data: incomeData,
                        borderColor: "rgba(16, 185, 129, 1)",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        borderWidth: 3,
                        tension: 0.2,
                        pointBackgroundColor: "rgba(16, 185, 129, 1)",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: false,
                    },
                    {
                        label: "Expense",
                        data: expenseData,
                        borderColor: "rgba(239, 68, 68, 1)",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        borderWidth: 3,
                        tension: 0.2,
                        pointBackgroundColor: "rgba(239, 68, 68, 1)",
                        pointBorderColor: "#ffffff",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: false,
                    },
                ],
            },
            tooltipDates: dates,
            allGroups: groups,
        };
    }, [filteredTransactions, groupingStrategy]);

    // Helper function to get week number
    function getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    // Helper function to get date of ISO week
    function getDateOfISOWeek(week, year) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const isoWeekStart = simple;
        if (dayOfWeek <= 4) {
            isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
            isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        return isoWeekStart;
    }

    // Get grouping label for display
    const getGroupingLabel = () => {
        switch (groupingStrategy) {
            case 'day': return 'Daily';
            case 'week': return 'Weekly';
            case 'month': return 'Monthly';
            default: return 'Daily';
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart'
        },
        plugins: {
            legend: {
                position: "top",
                labels: { 
                    color: "#374151", 
                    font: { 
                        size: 13, 
                        family: "Inter",
                        weight: '600'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                },
            },
            title: {
                display: true,
                text: `Income vs Expense Trend (${getGroupingLabel()})`,
                font: { 
                    size: 18, 
                    weight: 'bold',
                    family: "Inter"
                },
                color: '#1f2937',
                padding: { 
                    top: 10,
                    bottom: 30 
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#4b5563',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                boxPadding: 6,
                titleFont: {
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    size: 14
                },
                callbacks: {
                    title: function(tooltipItems) {
                        const index = tooltipItems[0].dataIndex;
                        const tooltipDate = tooltipDates[index];
                        
                        switch (groupingStrategy) {
                            case 'day':
                                return tooltipDate.toLocaleDateString('en-US', { 
                                    weekday: 'short',
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                });
                            case 'week':
                                return `Week ${tooltipDate.weekNumber}: ${tooltipDate.weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${tooltipDate.weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                            case 'month':
                            default:
                                return tooltipDate.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                });
                        }
                    },
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += currencySymbol + context.parsed.y.toFixed(2);
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { 
                    display: true,
                    color: 'rgba(229, 231, 235, 0.4)',
                    drawBorder: false
                },
                ticks: { 
                    color: "#6B7280",
                    font: {
                        size: 12
                    },
                    maxRotation: 45
                },
                title: {
                    display: true,
                    text: groupingStrategy === 'day' ? 'Date' : 
                          groupingStrategy === 'week' ? 'Week' : 'Month',
                    color: '#6B7280',
                    font: {
                        size: 13,
                        weight: '600'
                    },
                    padding: { top: 10 }
                }
            },
            y: { 
                grid: { 
                    color: "rgba(229, 231, 235, 0.4)",
                    drawBorder: false
                },
                ticks: { 
                    color: "#6B7280",
                    font: {
                        size: 12
                    },
                    callback: function(value) {
                        return currencySymbol + value.toLocaleString();
                    }
                },
                title: {
                    display: true,
                    text: `Amount (${currencySymbol})`,
                    color: '#6B7280',
                    font: {
                        size: 13,
                        weight: '600'
                    },
                    padding: { bottom: 10 }
                },
                beginAtZero: true
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    };

    // Calculate totals
    const totalIncome = filteredTransactions
        .filter(item => item.type === "Income")
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    const totalExpense = filteredTransactions
        .filter(item => item.type === "Expense")
        .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    const netBalance = totalIncome - totalExpense;

    return (
        <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-300 transition-all duration-300 hover:shadow-lg h-fit">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="font-semibold text-lg text-text">
                        Income vs Expense Trend
                    </h2>
                    <p className="text-sm text-gray-500">
                        {dateFrom && dateTo 
                            ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
                            : 'All time'
                        }
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                        {getGroupingLabel()} View
                    </div>
                    <div className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                        {allGroups.length} {groupingStrategy === 'day' ? 'days' : 
                        groupingStrategy === 'week' ? 'weeks' : 'months'}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                    <p className="text-sm text-green-700 font-medium">Total Income</p>
                    <p className="text-xl font-bold text-green-600">
                        {currencySymbol}{totalIncome.toFixed(2)}
                    </p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                    <p className="text-sm text-red-700 font-medium">Total Expense</p>
                    <p className="text-xl font-bold text-red-600">
                        {currencySymbol}{totalExpense.toFixed(2)}
                    </p>
                </div>
                <div className={`border rounded-lg p-3 text-center ${
                    netBalance >= 0 
                        ? 'bg-blue-50 border-blue-100' 
                        : 'bg-yellow-50 border-yellow-100'
                }`}>
                    <p className="text-sm font-medium">Net Balance</p>
                    <p className={`text-xl font-bold ${
                        netBalance >= 0 ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                        {currencySymbol}{netBalance.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                {filteredTransactions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <LineChart className="w-10 h-10 mb-4" />
                        <p className="text-lg font-medium">No transaction data available</p>
                        <p className="text-sm mt-2">Try selecting a different period</p>
                    </div>
                ) : (
                    <Line 
                        key={`chart-${groupingStrategy}-${filteredTransactions.length}-${allGroups.length}`} 
                        data={chartData} 
                        options={options} 
                    />
                )}
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                        <span className="font-medium">View:</span> {getGroupingLabel()}
                        <span className="mx-2">•</span>
                        <span className="font-medium">Transactions:</span> {filteredTransactions.length}
                    </div>
                    <div>
                        <span className="font-medium">Period:</span> {datePreset || 'Custom'}
                    </div>
                </div>
            </div>
        </div>
    );
}