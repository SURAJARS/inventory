import InventoryTransaction from './src/models/InventoryTransaction.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kannan-inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Delete orphaned transactions (productId is null or doesn't exist)
  const result = await InventoryTransaction.deleteMany({ 
    $or: [
      { productId: null },
      { productId: { $exists: false } }
    ]
  });
  
  console.log('✓ Deleted:', result.deletedCount, 'orphaned transactions');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
