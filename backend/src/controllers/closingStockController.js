import InventoryTransaction from '../models/InventoryTransaction.js';
import OpeningStock from '../models/OpeningStock.js';
import {
  getClosingStockReport,
  getTransactionHistory
} from '../services/inventoryCalculator.js';
import { generateClosingStockPDF, generateTransactionPDF } from '../services/pdfGenerator.js';
import { generateClosingStockExcel, generateTransactionExcel } from '../services/excelGenerator.js';

// ===== CLOSING STOCK =====
export const calculateClosingStock = async (req, res, next) => {
  try {
    const { closingDate, categoryId, subCategoryId, brandId, productId } = req.body;

    if (!closingDate) {
      return res.status(400).json({
        success: false,
        message: 'Closing date is required'
      });
    }

    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (brandId) filters.brandId = brandId;
    if (productId) filters.productId = productId;

    const reportData = await getClosingStockReport(closingDate, filters);

    res.json({
      success: true,
      message: 'Closing stock calculated successfully',
      data: {
        date: closingDate,
        products: reportData
      }
    });
  } catch (err) {
    next(err);
  }
};

export const downloadClosingStockPDF = async (req, res, next) => {
  try {
    const { closingDate, categoryId, subCategoryId, brandId, productId } = req.query;

    if (!closingDate) {
      return res.status(400).json({
        success: false,
        message: 'Closing date is required'
      });
    }

    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (brandId) filters.brandId = brandId;
    if (productId) filters.productId = productId;

    const reportData = await getClosingStockReport(closingDate, filters);

    if (reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inventory data available for the selected date'
      });
    }

    const pdfBuffer = await generateClosingStockPDF(closingDate, reportData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="closing-stock-${closingDate}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const downloadClosingStockExcel = async (req, res, next) => {
  try {
    const { closingDate, categoryId, subCategoryId, brandId, productId } = req.query;

    if (!closingDate) {
      return res.status(400).json({
        success: false,
        message: 'Closing date is required'
      });
    }

    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (brandId) filters.brandId = brandId;
    if (productId) filters.productId = productId;

    const reportData = await getClosingStockReport(closingDate, filters);

    if (reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No inventory data available for the selected date'
      });
    }

    const excelBuffer = generateClosingStockExcel(closingDate, reportData);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="closing-stock-${closingDate}.xlsx"`);
    res.send(excelBuffer);
  } catch (err) {
    next(err);
  }
};

// ===== TRANSACTIONS =====
export const getTransactions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      transactionType,
      categoryId,
      subCategoryId,
      brandId,
      productId,
      performedBy,
      startDate,
      endDate
    } = req.query;

    const filters = {};
    if (transactionType) filters.transactionType = transactionType;
    if (categoryId) filters.categoryId = categoryId;
    if (subCategoryId) filters.subCategoryId = subCategoryId;
    if (brandId) filters.brandId = brandId;
    if (productId) filters.productId = productId;
    if (performedBy) filters.performedBy = performedBy;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const result = await getTransactionHistory(filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

export const downloadTransactionsPDF = async (req, res, next) => {
  try {
    const { startDate, endDate, transactionType, categoryId, subCategoryId, brandId, productId } =
      req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query = {};

    if (transactionType) query.transactionType = transactionType;
    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (brandId) query.brandId = brandId;
    if (productId) query.productId = productId;

    query.transactionDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    const transactions = await InventoryTransaction.find(query)
      .populate('productId')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('brandId')
      .populate('unitId')
      .populate('performedBy', 'fullName')
      .sort({ transactionDate: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found for the selected date range'
      });
    }

    const pdfBuffer = await generateTransactionPDF(transactions, startDate, endDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${startDate}-to-${endDate}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

export const downloadTransactionsExcel = async (req, res, next) => {
  try {
    const { startDate, endDate, transactionType, categoryId, subCategoryId, brandId, productId } =
      req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const query = {};

    if (transactionType) query.transactionType = transactionType;
    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (brandId) query.brandId = brandId;
    if (productId) query.productId = productId;

    query.transactionDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };

    const transactions = await InventoryTransaction.find(query)
      .populate('productId')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('brandId')
      .populate('unitId')
      .populate('performedBy', 'fullName')
      .sort({ transactionDate: -1 });

    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found for the selected date range'
      });
    }

    const excelBuffer = generateTransactionExcel(transactions, startDate, endDate);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${startDate}-to-${endDate}.xlsx"`);
    res.send(excelBuffer);
  } catch (err) {
    next(err);
  }
};
