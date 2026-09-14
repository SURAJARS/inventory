import XLSX from 'xlsx';

export const generateClosingStockExcel = (closingDate, reportData, storeName = 'Kannan Stores') => {
  try {
    const workbook = XLSX.utils.book_new();

    // Prepare data for Excel
    const sheetData = [
      [storeName],
      ['CLOSING STOCK REPORT'],
      [''],
      [
        'Report Date:',
        new Date(closingDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      ],
      [
        'Generated:',
        new Date().toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      ],
      [''],
      [
        'Category',
        'Sub-Category',
        'Product',
        'Opening Stock',
        'Stock In',
        'Stock Out',
        'Closing Stock'
      ]
    ];

    // Add data rows
    reportData.forEach((row) => {
      const closing = row.openingStock + row.stockIn - row.stockOut;
      sheetData.push([
        row.categoryName || '',
        row.subCategoryName || '',
        row.productName || '',
        row.openingStock,
        row.stockIn,
        row.stockOut,
        Math.max(0, closing)
      ]);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 }
    ];

    // Freeze header row (row 7 is the header after title and date info)
    worksheet['!freeze'] = { xSplit: 0, ySplit: 7 };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Closing Stock');

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  } catch (err) {
    console.error('Error generating Excel:', err);
    throw err;
  }
};

export const generateTransactionExcel = (transactions, startDate, endDate, storeName = 'Kannan Stores') => {
  try {
    const workbook = XLSX.utils.book_new();

    // Prepare data for Excel
    const sheetData = [
      [storeName],
      ['TRANSACTION REPORT'],
      [''],
      [
        'Period:',
        `${new Date(startDate).toLocaleDateString('en-IN')} to ${new Date(endDate).toLocaleDateString('en-IN')}`
      ],
      [
        'Generated:',
        new Date().toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      ],
      [''],
      ['Date', 'Type', 'Category', 'Sub-Category', 'Brand', 'Product', 'Quantity', 'Unit', 'User', 'Remarks']
    ];

    // Add transaction rows
    transactions.forEach((row) => {
      const txnDate = new Date(row.transactionDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const type = row.transactionType === 'STOCK_IN' ? 'STOCK IN' : 'STOCK OUT';
      const user = row.performedBy?.fullName || 'N/A';

      sheetData.push([
        txnDate,
        type,
        row.categoryId?.name || '',
        row.subCategoryId?.name || '',
        row.brand || '',
        row.productId?.name || '',
        row.quantity,
        row.unitId?.code || '',
        user,
        row.remarks || ''
      ]);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 10 },
      { wch: 8 },
      { wch: 15 },
      { wch: 20 }
    ];

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 7 };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  } catch (err) {
    console.error('Error generating Excel:', err);
    throw err;
  }
};
