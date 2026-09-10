import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import stockInRoutes from './routes/stockIn.js';
import stockOutRoutes from './routes/stockOut.js';
import currentStockRoutes from './routes/currentStock.js';
import closingStockRoutes from './routes/closingStock.js';
import openingStockRoutes from './routes/openingStock.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'https://inventory-virid-rho.vercel.app/',
      'https://inventory-edtaavya1-kannan-stores-inventory.vercel.app',
      'http://localhost:3000'
    ],
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kannan-inventory';

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✓ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-in', stockInRoutes);
app.use('/api/stock-out', stockOutRoutes);
app.use('/api/current-stock', currentStockRoutes);
app.use('/api/closing-stock', closingStockRoutes);
app.use('/api/opening-stock', openingStockRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Kannan Stores Inventory API is running'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

export default app;
