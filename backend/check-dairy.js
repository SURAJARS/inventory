import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

try {
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kannan-inventory');
  
  const db = conn.connection.db;
  const products = db.collection('products');
  
  console.log('Checking for Dairy product (ID: 6aa2e9c35458c361f335b6e7)...\n');
  
  // The Dairy product ID
  const dairyProductId = new mongoose.Types.ObjectId('6aa2e9c35458c361f335b6e7');
  
  const product = await products.findOne({ _id: dairyProductId });
  console.log('Result:', product ? 'FOUND' : 'NOT FOUND (DELETED)');
  if (product) {
    console.log('Name:', product.name);
    console.log('isActive:', product.isActive);
  }
  
  process.exit(0);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
