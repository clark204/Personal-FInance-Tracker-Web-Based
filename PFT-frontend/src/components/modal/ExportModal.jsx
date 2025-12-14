import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import PeriodSelect from "../common/PeriodSelect";
import AccountFilter from "../common/AccountFilter";
import { useExport } from "../../hooks/export";

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


    const handleExport = () => {
        if (exportForm.type === 'budgets') {
            handleExportExcelBudgets();
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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center blur-bg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-6">
                        {/* HEADER */}
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-text">
                                    Export Transaction Data
                                </h2>
                                <p className="text-sm text-text/70">
                                    Configure filters and export your transactions
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-text-secondary/50 transition"
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5 text-text" />
                            </button>
                        </div>

                        {/* FORM */}
                        <div className="space-y-4">
                            <AccountFilter
                                selectedAccount={exportForm.account_id}
                                onSelect={(value) => handleChange("account_id", value)}
                                disabled={isLoading}
                            />

                            <div>
                                <label className="label-style">Type</label>
                                <select
                                    value={exportForm.type}
                                    onChange={(e) => handleChange("type", e.target.value)}
                                    className="w-full rounded-lg border border-border px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    <option value="both">Both (Income & Expense)</option>
                                    <option value="income">Income Only</option>
                                    <option value="expense">Expense Only</option>
                                    <option value="budgets">Budget</option>
                                </select>
                            </div>

                            <PeriodSelect
                                datePreset={exportForm.datePreset}
                                dateFrom={exportForm.date_from}
                                dateTo={exportForm.date_to}
                                onPresetChange={applyPreset}
                                onDateFromChange={(v) => handleChange("date_from", v)}
                                onDateToChange={(v) => handleChange("date_to", v)}
                                disabled={isLoading}
                            />

                            {/* Preview Count */}
                            <div className={`rounded-lg border px-4 py-3 text-sm ${count > 0
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-gray-50 text-gray-500'
                                }`}>
                                {isCountLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                        <span>Counting transactions...</span>
                                    </div>
                                ) : (
                                    <>
                                        {count} {exportForm.type === 'budgets' ? 'budget' : 'transaction'}
                                        {count !== 1 && 's'} will be exported
                                        {count === 0 && " (no matching transactions)"}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-6 flex">

                            <button
                                onClick={handleExport}
                                disabled={count === 0 || isLoading}
                                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium 
                                         disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    '📄 Export Excel'
                                )}
                            </button>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={onClose}
                                className="text-sm text-text hover:font-medium transition disabled:opacity-50 w-full"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}