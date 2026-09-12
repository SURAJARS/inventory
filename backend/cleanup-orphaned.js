import InventoryTransaction from './src/models/InventoryTransaction.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kannan-inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Find orphaned transactions (productId is null)
  const orphaned = await InventoryTransaction.find({ productId: null });
  
  console.log('Found orphaned transactions:', orphaned.length);
  orphaned.forEach(t => {
    console.log('  ID:', t._id);
    console.log('  Type:', t.transactionType);
    console.log('  Qty:', t.quantity);
    console.log('  Date:', t.transactionDate);
    console.log('  ---');
  });
  
  if (orphaned.length > 0) {
    // Delete orphaned transactions
    const result = await InventoryTransaction.deleteMany({ productId: null });
    console.log('\n✓ Deleted:', result.deletedCount, 'orphaned transactions');
  } else {
    console.log('\n✓ No orphaned transactions found');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
