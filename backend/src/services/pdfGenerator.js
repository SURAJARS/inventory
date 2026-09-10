import PDFDocument from 'pdfkit';

export const generateClosingStockPDF = (closingDate, reportData, storeName = 'Kannan Stores') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30
      });

      let buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(storeName, { align: 'center' });
      doc.fontSize(14).text('CLOSING STOCK REPORT', { align: 'center' });

      // Date info
      doc.fontSize(10).font('Helvetica').moveDown(0.5);
      const reportDate = new Date(closingDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const generatedDate = new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.text(`Report Date: ${reportDate}`);
      doc.text(`Generated: ${generatedDate}`);

      // Table setup
      doc.moveDown(1);

      const tableTop = doc.y;
      const col1X = 30;
      const col2X = 90;
      const col3X = 150;
      const col4X = 210;
      const col5X = 270;
      const col6X = 330;
      const col7X = 390;

      const rowHeight = 20;
      const pageHeight = doc.page.height;
      const pageBottom = pageHeight - 50;

      let currentY = tableTop;

      // Helper function to draw table header
      const drawHeader = (yPos) => {
        doc.fontSize(9).font('Helvetica-Bold');
        doc
          .text('Category', col1X, yPos, { width: 55 })
          .text('SubCat', col2X, yPos, { width: 55 })
          .text('Product', col3X, yPos, { width: 55 })
          .text('Opening', col4X, yPos, { width: 55 })
          .text('In', col5X, yPos, { width: 55 })
          .text('Out', col6X, yPos, { width: 55 })
          .text('Closing', col7X, yPos, { width: 55 });

        // Draw line
        doc.moveTo(30, yPos + rowHeight - 5).lineTo(540, yPos + rowHeight - 5).stroke();
        return yPos + rowHeight;
      };

      currentY = drawHeader(currentY);

      // Draw rows
      doc.fontSize(8).font('Helvetica');

      reportData.forEach((row, index) => {
        // Check if we need a new page
        if (currentY + rowHeight > pageBottom) {
          doc.addPage();
          currentY = 30;
          currentY = drawHeader(currentY);
        }

        const closing = row.openingStock + row.stockIn - row.stockOut;

        doc
          .text(row.categoryName || '-', col1X, currentY, { width: 55 })
          .text(row.subCategoryName || '-', col2X, currentY, { width: 55 })
          .text(row.productName || '-', col3X, currentY, { width: 55 })
          .text(row.openingStock.toString(), col4X, currentY, { width: 55, align: 'right' })
          .text(row.stockIn.toString(), col5X, currentY, { width: 55, align: 'right' })
          .text(row.stockOut.toString(), col6X, currentY, { width: 55, align: 'right' })
          .text(closing.toString(), col7X, currentY, { width: 55, align: 'right' });

        currentY += rowHeight;
      });

      // Footer
      doc
        .fontSize(8)
        .text(`Total Products: ${reportData.length}`, 30, pageBottom, { align: 'left' });
      doc.text(`Page 1 of 1`, 520, pageBottom, { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateTransactionPDF = (transactions, startDate, endDate, storeName = 'Kannan Stores') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 30,
        bufferPages: true
      });

      let buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text(storeName, { align: 'center' });
      doc.fontSize(14).text('TRANSACTION REPORT', { align: 'center' });

      // Date info
      doc.fontSize(10).font('Helvetica').moveDown(0.5);
      const start = new Date(startDate).toLocaleDateString('en-IN');
      const end = new Date(endDate).toLocaleDateString('en-IN');
      const generatedDate = new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.text(`Period: ${start} to ${end}`);
      doc.text(`Generated: ${generatedDate}`);

      // Table setup
      doc.moveDown(1);

      const tableTop = doc.y;
      const col1X = 30;
      const col2X = 90;
      const col3X = 150;
      const col4X = 210;
      const col5X = 270;
      const col6X = 330;

      const rowHeight = 18;
      const pageHeight = doc.page.height;
      const pageBottom = pageHeight - 50;

      let currentY = tableTop;

      // Helper function to draw table header
      const drawHeader = (yPos) => {
        doc.fontSize(8).font('Helvetica-Bold');
        doc
          .text('Date', col1X, yPos, { width: 55 })
          .text('Type', col2X, yPos, { width: 55 })
          .text('Product', col3X, yPos, { width: 55 })
          .text('Qty', col4X, yPos, { width: 55, align: 'right' })
          .text('User', col5X, yPos, { width: 55 })
          .text('Remarks', col6X, yPos, { width: 220 });

        // Draw line
        doc.moveTo(30, yPos + rowHeight - 5).lineTo(550, yPos + rowHeight - 5).stroke();
        return yPos + rowHeight;
      };

      currentY = drawHeader(currentY);

      // Draw rows
      doc.fontSize(7).font('Helvetica');

      transactions.forEach((row) => {
        // Check if we need a new page
        if (currentY + rowHeight > pageBottom) {
          doc.addPage();
          currentY = 30;
          currentY = drawHeader(currentY);
        }

        const txnDate = new Date(row.transactionDate).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const type = row.transactionType === 'STOCK_IN' ? 'IN' : 'OUT';
        const user = row.performedBy?.fullName || 'N/A';
        const remarks = row.remarks || '';

        doc
          .text(txnDate, col1X, currentY, { width: 55 })
          .text(type, col2X, currentY, { width: 55 })
          .text(row.productId?.name || '-', col3X, currentY, { width: 55 })
          .text(row.quantity.toString(), col4X, currentY, { width: 55, align: 'right' })
          .text(user, col5X, currentY, { width: 55 })
          .text(remarks.substring(0, 30), col6X, currentY, { width: 220 });

        currentY += rowHeight;
      });

      // Footer
      doc
        .fontSize(8)
        .text(`Total Transactions: ${transactions.length}`, 30, pageBottom, { align: 'left' });
      doc.text(`Page 1 of 1`, 520, pageBottom, { align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
