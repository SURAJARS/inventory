import OpeningStock from '../models/OpeningStock.js';
import Product from '../models/Product.js';

export const setOpeningStock = async (req, res, next) => {
  try {
    const { productId, quantity, unitId, effectiveDate, remarks } = req.body;

    // Validation
    if (!productId || quantity === undefined || !unitId || !effectiveDate) {
      return res.status(400).json({
        success: false,
        message: 'Product, quantity, unit, and effective date are required'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative'
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if opening stock already exists for this product
    let openingStock = await OpeningStock.findOne({ productId });

    if (openingStock) {
      // Update existing
      openingStock.quantity = quantity;
      openingStock.unitId = unitId;
      openingStock.effectiveDate = new Date(effectiveDate);
      openingStock.remarks = remarks;
      openingStock.updatedAt = new Date();
    } else {
      // Create new
      openingStock = new OpeningStock({
        productId,
        quantity,
        unitId,
        effectiveDate: new Date(effectiveDate),
        remarks,
        createdBy: req.user.id
      });
    }

    await openingStock.save();

    res.json({
      success: true,
      message: 'Opening stock set successfully',
      data: openingStock
    });
  } catch (err) {
    next(err);
  }
};

export const getOpeningStock = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const openingStock = await OpeningStock.findOne({ productId })
      .populate('productId')
      .populate('unitId')
      .populate('createdBy', 'fullName');

    if (!openingStock) {
      // Return default opening stock of 0 if not set
      return res.json({
        success: true,
        data: {
          quantity: 0,
          message: 'No opening stock set for this product'
        }
      });
    }

    res.json({
      success: true,
      data: openingStock
    });
  } catch (err) {
    next(err);
  }
};

export const getAllOpeningStocks = async (req, res, next) => {
  try {
    const openingStocks = await OpeningStock.find()
      .populate('productId', 'name code')
      .populate('unitId', 'code')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: openingStocks
    });
  } catch (err) {
    next(err);
  }
};
