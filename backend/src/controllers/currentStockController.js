import Product from '../models/Product.js';
import { getCurrentStock } from '../services/inventoryCalculator.js';

export const getCurrentStockAll = async (req, res, next) => {
  try {
    const { categoryId, subCategoryId, brand } = req.query;

    const query = { isActive: true };
    if (categoryId) query.categoryId = categoryId;
    if (subCategoryId) query.subCategoryId = subCategoryId;
    if (brand) query.brand = brand;

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('unitId', 'code name')
      .sort({ name: 1 });

    // Get current stock for each product
    const stockData = await Promise.all(
      products.map(async (product) => {
        const currentStock = await getCurrentStock(product._id);
        return {
          _id: product._id,
          name: product.name,
          code: product.code,
          category: product.categoryId?.name || 'N/A',
          categoryId: product.categoryId?._id || null,
          subCategory: product.subCategoryId?.name || 'N/A',
          subCategoryId: product.subCategoryId?._id || null,
          brand: product.brand || 'N/A',
          unit: product.unitId?.code || 'N/A',
          currentStock: currentStock || 0,
          minimumStockLevel: product.minimumStockLevel || 0,
          isLowStock: (currentStock || 0) < (product.minimumStockLevel || 0)
        };
      })
    );

    res.json({
      success: true,
      data: stockData
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrentStockByProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('unitId');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const currentStock = await getCurrentStock(id);

    if (currentStock === undefined || currentStock === null) {
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate current stock',
        currentStock
      });
    }

    res.json({
      success: true,
      data: {
        _id: product._id,
        name: product.name,
        code: product.code,
        category: product.categoryId?.name || 'N/A',
        subCategory: product.subCategoryId?.name || 'N/A',
        brand: product.brand || 'N/A',
        unit: product.unitId?.code || 'N/A',
        currentStock: currentStock || 0,
        minimumStockLevel: product.minimumStockLevel,
        isLowStock: (currentStock || 0) < (product.minimumStockLevel || 0)
      }
    });
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.length < 1) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Search by product name or code
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    })
      .populate('categoryId', 'name')
      .populate('subCategoryId', 'name')
      .populate('unitId', 'code name')
      .limit(parseInt(limit));

    // Get current stock for each
    const stockData = await Promise.all(
      products.map(async (product) => {
        const currentStock = await getCurrentStock(product._id);
        return {
          _id: product._id,
          name: product.name,
          code: product.code,
          category: product.categoryId?.name,
          subCategory: product.subCategoryId?.name,
          brand: product.brand,
          unit: product.unitId?.code,
          currentStock
        };
      })
    );

    res.json({
      success: true,
      data: stockData
    });
  } catch (err) {
    next(err);
  }
};
