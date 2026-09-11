import InventoryTransaction from './src/models/InventoryTransaction.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kannan-inventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  // Find transactions with 70 or 45 quantity (French Fries) that are on Sep 10
  const txns = await InventoryTransaction.find({ 
    quantity: { $in: [70, 45] },
    transactionType: 'STOCK_IN'
  }).sort({ createdAt: -1 }).limit(10);
  
  console.log('Found transactions:');
  txns.forEach(t => {
    console.log('  ID:', t._id);
    console.log('  Qty:', t.quantity);
    console.log('  TransactionDate:', t.transactionDate);
    console.log('  CreatedAt:', t.createdAt);
    console.log('  CreatedAt Day:', new Date(t.createdAt).toISOString().split('T')[0]);
    console.log('  ---');
  });
  
  // For transactions where createdAt is Sep 11 but transactionDate is Sep 10, update to Sep 11
  const sep10 = new Date('2026-09-10T00:00:00.000Z');
  const sep11 = new Date('2026-09-11T00:00:00.000Z');
  
  const toUpdate = txns.filter(t => {
    const createdDay = new Date(t.createdAt).toISOString().split('T')[0];
    return t.transactionDate.getTime() === sep10.getTime() && createdDay === '2026-09-11';
  });
  
  console.log('Transactions to update:', toUpdate.length);
  
  if (toUpdate.length > 0) {
    const ids = toUpdate.map(t => t._id);
    const result = await InventoryTransaction.updateMany(
      { _id: { $in: ids } },
      { transactionDate: sep11 }
    );
    console.log('Updated:', result.modifiedCount, 'transactions to Sep 11');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
