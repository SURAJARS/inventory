import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required']
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'Sub-category is required']
    },
    brand: {
      type: String,
      trim: true
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    minimumStockLevel: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Index for common queries
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ subCategoryId: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });

export default mongoose.model('Product', productSchema);
