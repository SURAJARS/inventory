import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionDate: {
      type: Date,
      required: [true, 'Transaction date is required'],
      index: true
    },
    transactionType: {
      type: String,
      enum: ['STOCK_IN', 'STOCK_OUT'],
      required: [true, 'Transaction type is required'],
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: true
    },
    brand: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be greater than 0']
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User performing transaction is required']
    },
    remarks: String,
    referenceNumber: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
inventoryTransactionSchema.index({ productId: 1, transactionDate: 1 });
inventoryTransactionSchema.index({ productId: 1, transactionType: 1 });
inventoryTransactionSchema.index({ categoryId: 1, transactionDate: 1 });
inventoryTransactionSchema.index({ transactionDate: 1 });

export default mongoose.model('InventoryTransaction', inventoryTransactionSchema);
