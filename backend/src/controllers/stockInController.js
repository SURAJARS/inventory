import mongoose from 'mongoose';
import InventoryTransaction from '../models/InventoryTransaction.js';
import Product from '../models/Product.js';
import { getCurrentStock } from '../services/inventoryCalculator.js';

export const createStockIn = async (req, res, next) => {
  try {
    const {
      transactionDate,
      productId,
      quantity,
      remarks,
      referenceNumber
    } = req.body;

    // Validation
    if (!transactionDate || !productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Transaction date, product, and quantity are required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Get product with all references
    const product = await Product.findById(productId)
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('unitId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create transaction
    const systemUserId = req.user?.id || new mongoose.Types.ObjectId();
    // Parse date from frontend (format: YYYY-MM-DD) with current server time
    // Store as UTC to ensure consistency across timezones
    const txnDate = transactionDate ? new Date(transactionDate + 'T' + new Date().toISOString().split('T')[1]) : new Date();
    const transaction = new InventoryTransaction({
      transactionDate: txnDate,
      transactionType: 'STOCK_IN',
      productId,
      categoryId: product.categoryId._id,
      subCategoryId: product.subCategoryId._id,
      brand: product.brand || null,
      quantity,
      unitId: product.unitId ? product.unitId._id : null,
      performedBy: systemUserId,
      remarks,
      referenceNumber,
      createdBy: systemUserId
    });

    await transaction.save();

    // Populate for response
    await transaction.populate('productId');
    if (transaction.unitId) {
      await transaction.populate('unitId', 'code name');
    }
    await transaction.populate('performedBy', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Stock In recorded successfully',
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

export const getStockInHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, productId, startDate, endDate } = req.query;

    const query = { transactionType: 'STOCK_IN' };

    if (productId) query.productId = productId;

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await InventoryTransaction.find(query)
      .populate('productId', 'name')
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('unitId', 'code')
      .populate('performedBy', 'fullName')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await InventoryTransaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getStockInById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await InventoryTransaction.findById(id)
      .where('transactionType')
      .equals('STOCK_IN')
      .populate('productId')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('unitId')
      .populate('performedBy', 'fullName');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Stock In record not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};
