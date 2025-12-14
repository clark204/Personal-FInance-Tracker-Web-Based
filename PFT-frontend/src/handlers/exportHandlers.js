/* ----------------------------------
    Export actions
 ---------------------------------- */
export const handleExportExcelTransactions = async () => {
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
