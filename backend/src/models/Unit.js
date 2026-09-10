import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Unit code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Unit name is required'],
      trim: true
    },
    description: String,
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

export default mongoose.model('Unit', unitSchema);
