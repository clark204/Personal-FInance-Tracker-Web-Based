import { AnimatePresence, motion } from "framer-motion";
import { X, Download, FileSpreadsheet, FileText, Filter, Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import PeriodSelect from "../common/PeriodSelect";
import AccountFilter from "../common/AccountFilter";
import { useExport } from "../../hooks/export";
import AccountDropdown from "../common/AccountDropdown";

export default function ExportModal({ isOpen, onClose }) {
    const { useExportData, useExportCount } = useExport();

    const [exportForm, setExportForm] = useState({
        account_id: "",
        type: "",
        datePreset: "all",
        date_from: "",
        date_to: "",
    });

    // Use React Query hooks
    const {
        data: exportData,
        refetch: refetchExportData,
        isLoading: isExportDataLoading,
        isRefetching: isExportDataRefetching
    } = useExportData(exportForm);

    const {
        data: count = 0,
        isLoading: isCountLoading,
        refetch: refetchCount
    } = useExportCount(exportForm);

    const isLoading = isExportDataLoading || isExportDataRefetching || isCountLoading;

    /* ----------------------------------
       Helpers
    ---------------------------------- */
    const handleChange = (field, value) => {
        setExportForm(prev => ({ ...prev, [field]: value }));
    };

    function applyPreset(preset) {
        const now = new Date();
        const start = new Date();

        if (preset === "all") {
            handleChange("date_from", "");
            handleChange("date_to", "");
            handleChange("datePreset", "all");
            return;
        }

        if (preset === "week") {
            start.setDate(now.getDate() - now.getDay());
        }

        if (preset === "month") {
            start.setDate(1);
        }

        if (preset === "year") {
            start.setMonth(0, 1);
        }

        if (preset !== "custom") {
            handleChange("date_from", start.toISOString().slice(0, 10));
            handleChange("date_to", now.toISOString().slice(0, 10));
        } else {
            handleChange("date_from", "");
            handleChange("date_to", "");
        }

        handleChange("datePreset", preset);
    }

    /* ----------------------------------
        Export actions
     ---------------------------------- */
    const handleExportExcelTransactions = async () => {
        try {
            const { data } = await refetchExportData();
            if (!data || !data.length) {
                alert("No data to export");
                return;
            }

            // Create workbook
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Finance App';
            workbook.created = new Date();

            // Create worksheet
            const worksheet = workbook.addWorksheet('Transactions');
            // Define columns
            worksheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Type', key: 'type', width: 12 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Amount', key: 'amount', width: 12 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Account', key: 'account', width: 15 },
                { header: 'Account Type', key: 'accountType', width: 15 },
                { header: 'Linked Budget', key: 'budget', width: 15 }
            ];

            worksheet.insertRow(1, ['TRANSACTIONS']);

            // Merge title row cells
            worksheet.mergeCells('A1:H1');

            // Style title row
            const titleRow = worksheet.getRow(1);
            titleRow.height = 30;
            titleRow.getCell(1).font = { name: 'Times New Roman', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFbd8b4f' } };

            // Style header row (row 2)
            const headerRow = worksheet.getRow(2);
            headerRow.height = 25;
            headerRow.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' } // Blue
                };
                cell.font = {
                    name: 'Times New Roman',
                    size: 12,
                    bold: true,
                    color: { argb: 'FFFFFFFF' } // White
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Add data rows (start at row 3)
            data.forEach((item, index) => {
                const row = worksheet.addRow({
                    date: item.Date,
                    type: item.Type,
                    category: item.Category || "Uncategorized",
                    amount: item.Amount,
                    description: item.Description || "",
                    account: item.Account || "Unknown",
                    accountType: item.Account_Type || "",
                    budget: item.Linked_Budget || ""
                });

                // Conditional coloring for Amount
                const amountCell = row.getCell('amount');
                if (item.Type === 'Income') {
                    amountCell.font = { bold: true, color: { argb: 'FF107C41' } }; // Green
                } else if (item.Type === 'Expense') {
                    amountCell.font = { bold: true, color: { argb: 'FFE81123' } }; // Red
                }

                // Alternate row fill for readability
                if ((index + 1) % 2 === 0) { // adjust for data starting at row 3
                    row.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' } // Light gray
                        };
                    });
                }

                // Add borders to all cells
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Freeze header row (row 2)
            worksheet.views = [{ state: 'frozen', ySplit: 2 }];

            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], { type: 'application/octet-stream' }),
                `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`
            );

        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    const handleExportExcelBudgets = async () => {
        try {
            const { data } = await refetchExportData();

            if (!data || !data.budgets?.length) {
                alert("No budget data to export");
                return;
            }

            const { budgets, budget_transactions } = data;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Finance App';
            workbook.created = new Date();

            /* ============================
               BUDGETS SHEET
            ============================ */
            const budgetSheet = workbook.addWorksheet('Budgets');

            budgetSheet.columns = [
                { header: 'Budget ID', key: 'id', width: 12 },
                { header: 'Account', key: 'account', width: 18 },
                { header: 'Account Type', key: 'accountType', width: 15 },
                { header: 'Category', key: 'category', width: 20 },
                { header: 'Status', key: 'status', width: 14 },
                { header: 'Budget Amount', key: 'budgetAmount', width: 16 },
                { header: 'Spent', key: 'spent', width: 16 },
                { header: 'Start Date', key: 'startDate', width: 15 },
                { header: 'End Date', key: 'endDate', width: 15 },
                { header: 'Transactions Linked', key: 'linked', width: 22 }
            ];

            budgetSheet.insertRow(1, ['BUDGETS']);
            budgetSheet.mergeCells('A1:J1');

            const title = budgetSheet.getRow(1);
            title.height = 30;
            title.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            title.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            title.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF6B8E23' }
            };

            const headerRow = budgetSheet.getRow(2);
            headerRow.height = 25;
            headerRow.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            budgets.forEach((item, index) => {
                const row = budgetSheet.addRow({
                    id: item.Budget_ID,
                    account: item.Account,
                    accountType: item.Account_Type,
                    category: item.Category,
                    status: item.Status,
                    budgetAmount: item.Budget_Amount,
                    spent: item.Budget_Spent,
                    startDate: item.Start_Date,
                    endDate: item.End_Date,
                    linked: item.Linked_Transactions
                });

                const statusCell = row.getCell('status');
                statusCell.font = {
                    bold: true,
                    color: { argb: item.Status.toLowerCase() === 'active' ? 'FF107C41' : 'FFE81123' }
                };

                if ((index + 1) % 2 === 0) {
                    row.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' }
                        };
                    });
                }

                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            budgetSheet.views = [{ state: 'frozen', ySplit: 2 }];

            /* ============================
               TRANSACTIONS SHEET
            ============================ */
            const txSheet = workbook.addWorksheet('Budget Transactions');

            txSheet.columns = [
                { header: 'Budget ID', key: 'budgetId', width: 12 },
                { header: 'Budget Category', key: 'category', width: 20 },
                { header: 'Account', key: 'account', width: 18 },
                { header: 'Date', key: 'date', width: 14 },
                { header: 'Type', key: 'type', width: 12 },
                { header: 'Amount', key: 'amount', width: 16 },
                { header: 'Description', key: 'description', width: 30 }
            ];

            // Title
            txSheet.insertRow(1, ['BUDGET TRANSACTIONS']);
            txSheet.mergeCells('A1:G1');

            const txTitle = txSheet.getRow(1);
            txTitle.height = 28;
            txTitle.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            txTitle.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            txTitle.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF8B0000' } // Dark red
            };

            // Header row
            const txHeader = txSheet.getRow(2);
            txHeader.height = 24;
            txHeader.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Data rows
            budget_transactions.forEach((tx, index) => {
                const row = txSheet.addRow({
                    budgetId: tx.Budget_ID,
                    category: tx.Budget_Category,
                    account: tx.Account,
                    date: tx.Transaction_Date,
                    type: tx.Type,
                    amount: tx.Amount,
                    description: tx.Description ?? '-'
                });

                // Income / Expense coloring
                const amountCell = row.getCell('amount');
                amountCell.font = {
                    bold: true,
                    color: {
                        argb: tx.Type === 'income' ? 'FF107C41' : 'FFE81123'
                    }
                };

                // Zebra striping
                if ((index + 1) % 2 === 0) {
                    row.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' }
                        };
                    });
                }

                // Borders
                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Freeze header
            txSheet.views = [{ state: 'frozen', ySplit: 2 }];

            /* ============================
               SAVE FILE
            ============================ */
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], { type: 'application/octet-stream' }),
                `budgets_${new Date().toISOString().slice(0, 10)}.xlsx`
            );

        } catch (err) {
            console.error(err);
            alert("Failed to export budgets");
        }
    };

    const handleExportExcelSavings = async () => {
        try {
            const { data } = await refetchExportData();

            if (!data || !data.savings?.length) {
                alert("No savings data to export");
                return;
            }

            const { savings, savings_transactions } = data;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'Finance App';
            workbook.created = new Date();

            /* ============================
               SAVINGS SHEET
            ============================ */
            const savingsSheet = workbook.addWorksheet('Savings');

            savingsSheet.columns = [
                { header: 'Savings ID', key: 'id', width: 12 },
                { header: 'Savings Name', key: 'savingsName', width: 20 },
                { header: 'Account', key: 'account', width: 15 },
                { header: 'Account Type', key: 'accountType', width: 18 },
                { header: 'Target Amount', key: 'targetAmount', width: 16 },
                { header: 'Saved Amount', key: 'savedAmount', width: 16 },
                { header: 'Start Date', key: 'startDate', width: 15 },
                { header: 'Deadline', key: 'deadline', width: 15 },
                { header: 'Description', key: 'description', width: 25 },
                { header: 'Status', key: 'status', width: 14 },
            ];

            // Title row
            savingsSheet.insertRow(1, ['SAVINGS']);
            savingsSheet.mergeCells('A1:J1');

            const titleRow = savingsSheet.getRow(1);
            titleRow.height = 30;
            titleRow.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            titleRow.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF6B8E23' }
            };

            // Header row styling
            const headerRow = savingsSheet.getRow(2);
            headerRow.height = 24;
            headerRow.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Data rows
            savings.forEach((item, index) => {
                const row = savingsSheet.addRow({
                    id: item.Savings_ID,
                    savingsName: item.Savings_Name,
                    account: item.Account,
                    accountType: item.Account_Type,
                    targetAmount: item.Target_Amount,
                    savedAmount: item.Saved_Amount,
                    startDate: item.Start_Date,
                    deadline: item.Deadline,
                    description: item.Description,
                    status: item.Status
                });

                const statusCell = row.getCell('status');
                statusCell.font = {
                    bold: true,
                    color: {
                        argb: item.Status?.toLowerCase() === 'active'
                            ? 'FF107C41'
                            : 'FFE81123'
                    }
                };

                if ((index + 1) % 2 === 0) {
                    row.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' }
                        };
                    });
                }

                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            savingsSheet.views = [{ state: 'frozen', ySplit: 2 }];

            /* ============================
               SAVINGS TRANSACTIONS SHEET
            ============================ */
            const txSheet = workbook.addWorksheet('Savings Transactions');

            txSheet.columns = [
                { header: 'Savings ID', key: 'savingsId', width: 12 },
                { header: 'Transaction Date', key: 'transactionDate', width: 20 },
                { header: 'Type', key: 'type', width: 14 },
                { header: 'Amount', key: 'amount', width: 16 },
            ];

            txSheet.insertRow(1, ['SAVINGS TRANSACTIONS']);
            txSheet.mergeCells('A1:D1');

            const txTitle = txSheet.getRow(1);
            txTitle.height = 28;
            txTitle.getCell(1).font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            txTitle.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
            txTitle.getCell(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF8B0000' }
            };

            const txHeader = txSheet.getRow(2);
            txHeader.height = 24;
            txHeader.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF4F81BD' }
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            savings_transactions.forEach((tx, index) => {
                const row = txSheet.addRow({
                    savingsId: tx.Savings_ID,
                    transactionDate: tx.Transaction_Date,
                    type: tx.Type,
                    amount: tx.Amount
                });

                row.getCell('amount').font = {
                    bold: true,
                    color: { argb: tx.Type === 'deposit' ? 'FF107C41' : 'FFE81123' }
                };

                if ((index + 1) % 2 === 0) {
                    row.eachCell(cell => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' }
                        };
                    });
                }

                row.eachCell(cell => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            txSheet.views = [{ state: 'frozen', ySplit: 2 }];

            /* ============================
               SAVE FILE
            ============================ */
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], { type: 'application/octet-stream' }),
                `Savings_${new Date().toISOString().slice(0, 10)}.xlsx`
            );

        } catch (err) {
            console.error(err);
            alert("Failed to export Savings");
        }
    };

    const handleExport = () => {
        if (exportForm.type === 'budgets') {
            handleExportExcelBudgets();
        } else if (exportForm.type === 'savings') {
            handleExportExcelSavings();
        } else {
            handleExportExcelTransactions();
        }
    };

    /* ----------------------------------
       Refetch count when filters change
    ---------------------------------- */
    useEffect(() => {
        if (isOpen) {
            refetchCount();
        }
    }, [exportForm, isOpen, refetchCount]);

    /* ----------------------------------
       UI
    ---------------------------------- */
    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
                        onClick={isLoading ? undefined : onClose}
                    />

                    {/* Modal - Compact size */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ 
                                type: "tween",
                                duration: 0.2,
                                ease: "easeOut"
                            }}
                            className="bg-white rounded-lg shadow-lg w-full max-w-sm overflow-hidden border border-gray-200 pointer-events-auto"
                        >
                            {/* Compact Header */}
                            <div className="bg-gradient-to-r from-primary-gradient to-secondary-gradient border-b border-border/30 p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-white rounded-md border border-gray-200">
                                            <Download className="w-4 h-4 text-icon" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-text">
                                                Export Data
                                            </h2>
                                            <p className="text-xs text-text-secondary">
                                                Configure filters and export
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className="p-1.5 hover:bg-white/50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                        aria-label="Close modal"
                                    >
                                        <X className="w-4 h-4 text-text" />
                                    </button>
                                </div>
                            </div>

                            {/* Compact Form */}
                            <div className="p-4 space-y-4">
                                {/* Account Filter */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Account
                                    </label>
                                    <AccountDropdown
                                        selectedAccount={exportForm.account_id}
                                        onSelect={(value) => handleChange("account_id", value)}
                                        disabled={isLoading}
                                        size="small"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Data Type
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <select
                                            value={exportForm.type}
                                            onChange={(e) => handleChange("type", e.target.value)}
                                            disabled={isLoading}
                                            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 
                                                     focus:border-focus focus:ring-1 focus:ring-focus/20 outline-none transition-colors duration-150
                                                     disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="both">Both (Income & Expense)</option>
                                            <option value="income">Income Only</option>
                                            <option value="expense">Expense Only</option>
                                            <option value="budgets">Budgets</option>
                                            <option value="savings">Savings</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Period */}
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Date Range
                                    </label>
                                    <PeriodSelect
                                        datePreset={exportForm.datePreset}
                                        dateFrom={exportForm.date_from}
                                        dateTo={exportForm.date_to}
                                        onPresetChange={applyPreset}
                                        onDateFromChange={(v) => handleChange("date_from", v)}
                                        onDateToChange={(v) => handleChange("date_to", v)}
                                        disabled={isLoading}
                                        size="small"
                                    />
                                </div>

                                {/* Preview Count */}
                                <div className={`rounded-lg border px-3 py-2.5 text-sm ${
                                    count > 0
                                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-gray-50 text-gray-500'
                                }`}>
                                    {isCountLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            <span>Counting records...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-medium">{count}</span>{' '}
                                            {exportForm.type === 'budgets'
                                                ? 'budget'
                                                : exportForm.type === 'savings'
                                                    ? 'savings record'
                                                    : 'transaction'}
                                            {count !== 1 && 's'} will be exported
                                            {count === 0 && ' (no matching records)'}
                                        </>
                                    )}
                                </div>

                                {/* Export Button */}
                                <button
                                    onClick={handleExport}
                                    disabled={count === 0 || isLoading}
                                    className="w-full rounded-lg bg-button text-white text-sm font-medium py-2.5 
                                             hover:bg-hover-button transition-colors duration-150
                                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer 
                                             flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Preparing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileSpreadsheet className="w-3.5 h-3.5" />
                                            <span>Export Excel</span>
                                        </>
                                    )}
                                </button>

                                {/* Cancel Button */}
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-150 
                                             disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer py-1.5"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}