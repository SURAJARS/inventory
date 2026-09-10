import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Kannan Stores'
    },
    storeContact: String,
    storeAddress: String,
    reportHeader: String,
    currency: {
      type: String,
      default: 'INR'
    },
    allowNegativeStock: {
      type: Boolean,
      default: false
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

export default mongoose.model('Settings', settingsSchema);
