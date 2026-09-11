import mongoose from 'mongoose';
import InventoryTransaction from '../models/InventoryTransaction.js';
import OpeningStock from '../models/OpeningStock.js';

/**
 * Calculate current stock for a product
 * Current Stock = Opening Stock + Sum(Stock In) - Sum(Stock Out)
 */
export const getCurrentStock = async (productId) => {
  try {
    // Convert to ObjectId if string
    const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
      ? new mongoose.Types.ObjectId(productId) 
      : productId;

    console.log('DEBUG getCurrentStock: productId=', productId, 'ObjectId=', productObjectId.toString());

    // Get opening stock
    const openingStock = await OpeningStock.findOne({ productId: productObjectId });
    const openingQty = openingStock?.quantity || 0;
    console.log('DEBUG: openingQty=', openingQty);

    // Get all transactions for this product
    const result = await InventoryTransaction.aggregate([
      { $match: { productId: productObjectId } },
      {
        $group: {
          _id: '$productId',
          stockIn: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'STOCK_IN'] }, '$quantity', 0] }
          },
          stockOut: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'STOCK_OUT'] }, '$quantity', 0] }
          }
        }
      }
    ]);

    console.log('DEBUG: aggregation result=', result);

    if (result.length === 0) {
      console.log('DEBUG: No transactions found, returning opening qty=', openingQty);
      return openingQty;
    }

    const currentStock = openingQty + result[0].stockIn - result[0].stockOut;
    console.log('DEBUG: currentStock calculated=', currentStock);
    return Math.max(0, currentStock); // Never negative
  } catch (err) {
    console.error('Error calculating current stock:', err);
    throw err;
  }
};

/**
 * Calculate closing stock for a specific date
 * Closing Stock(date) = Opening Stock + Sum(Stock In <= date) - Sum(Stock Out <= date)
 */
export const getClosingStock = async (productId, closingDate) => {
  try {
    // Convert to ObjectId if string
    const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
      ? new mongoose.Types.ObjectId(productId) 
      : productId;

    // Convert to end of day
    const endOfDay = new Date(closingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get opening stock
    const openingStock = await OpeningStock.findOne({ productId: productObjectId });
    const openingQty = openingStock?.quantity || 0;

    // Get transactions up to the closing date
    const result = await InventoryTransaction.aggregate([
      {
        $match: {
          productId: productObjectId,
          transactionDate: { $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: '$productId',
          stockIn: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'STOCK_IN'] }, '$quantity', 0] }
          },
          stockOut: {
            $sum: { $cond: [{ $eq: ['$transactionType', 'STOCK_OUT'] }, '$quantity', 0] }
          }
        }
      }
    ]);

    if (result.length === 0) {
      return openingQty;
    }

    const closingStock = openingQty + result[0].stockIn - result[0].stockOut;
    return Math.max(0, closingStock);
  } catch (err) {
    console.error('Error calculating closing stock:', err);
    throw err;
  }
};

/**
 * Get closing stock report for a date with optional filters
 */
export const getClosingStockReport = async (closingDate, filters = {}) => {
  try {
    const endOfDay = new Date(closingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build match stage based on filters
    const matchStage = { transactionDate: { $lte: endOfDay } };
    if (filters.categoryId) matchStage.categoryId = filters.categoryId;
    if (filters.subCategoryId) matchStage.subCategoryId = filters.subCategoryId;
    if (filters.brandId) matchStage.brandId = filters.brandId;
    if (filters.productId) matchStage.productId = filters.productId;

    // Get all transactions up to the date
    const transactions = await InventoryTransaction.find(matchStage)
      .populate('productId')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('brandId')
      .populate('unitId')
      .lean();

    // Group by product
    const productMap = new Map();
    transactions.forEach((txn) => {
      // Skip transactions with null product (deleted products)
      if (!txn.productId) return;
      
      const key = txn.productId._id;
      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: txn.productId._id,
          productName: txn.productId.name,
          categoryName: txn.categoryId?.name || '-',
          subCategoryName: txn.subCategoryId?.name || '-',
          brandName: txn.brandId?.name || '-',
          unitCode: txn.unitId?.code || '-',
          stockIn: 0,
          stockOut: 0,
          transactionCount: 0
        });
      }

      const product = productMap.get(key);
      if (txn.transactionType === 'STOCK_IN') {
        product.stockIn += txn.quantity;
      } else {
        product.stockOut += txn.quantity;
      }
      product.transactionCount++;
    });

    // Calculate opening and closing stock
    const reportData = [];
    for (const [productId, productData] of productMap) {
      const openingStock = await OpeningStock.findOne({ productId });
      const openingQty = openingStock?.quantity || 0;
      const closingQty = openingQty + productData.stockIn - productData.stockOut;

      reportData.push({
        ...productData,
        openingStock: openingQty,
        closingStock: Math.max(0, closingQty)
      });
    }

    return reportData;
  } catch (err) {
    console.error('Error generating closing stock report:', err);
    throw err;
  }
};

/**
 * Get transaction history with filters and pagination
 */
export const getTransactionHistory = async (filters = {}, page = 1, limit = 50) => {
  try {
    const query = {};

    if (filters.transactionType) query.transactionType = filters.transactionType;
    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.subCategoryId) query.subCategoryId = filters.subCategoryId;
    if (filters.brandId) query.brandId = filters.brandId;
    if (filters.productId) query.productId = filters.productId;
    if (filters.performedBy) query.performedBy = filters.performedBy;

    if (filters.startDate || filters.endDate) {
      query.transactionDate = {};
      if (filters.startDate) {
        query.transactionDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;

    const transactions = await InventoryTransaction.find(query)
      .populate('productId')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('brandId')
      .populate('unitId')
      .populate('performedBy', 'fullName')
      .sort({ transactionDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await InventoryTransaction.countDocuments(query);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error('Error getting transaction history:', err);
    throw err;
  }
};
