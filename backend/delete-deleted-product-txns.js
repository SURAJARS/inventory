import InventoryTransaction from './src/models/InventoryTransaction.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kannan-inventory');
  
  const db = conn.connection.db;
  const transactions = db.collection('inventorytransactions');
  const products = db.collection('products');
  
  console.log('Finding transactions with deleted products...\n');
  
  // Get all transactions
  const allTxns = await transactions.find({}).toArray();
  
  console.log('Total transactions:', allTxns.length);
  
  // Check which transactions have deleted products
  const txnsToDelete = [];
  for (const txn of allTxns) {
    if (txn.productId) {
      const product = await products.findOne({ _id: txn.productId });
      if (!product) {
        txnsToDelete.push(txn._id);
        console.log('  Found orphaned transaction:');
        console.log('    ID:', txn._id);
        console.log('    ProductId:', txn.productId, '(DELETED)');
        console.log('    Qty:', txn.quantity);
        console.log('    Type:', txn.transactionType);
      }
    }
  }
  
  console.log('\nTransactions to delete:', txnsToDelete.length);
  
  if (txnsToDelete.length > 0) {
    const result = await transactions.deleteMany({ _id: { $in: txnsToDelete } });
    console.log('✓ Deleted:', result.deletedCount, 'transactions with deleted products');
  }
  
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
