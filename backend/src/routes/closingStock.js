import express from 'express';
import {
  calculateClosingStock,
  downloadClosingStockPDF,
  downloadClosingStockExcel,
  getTransactions,
  downloadTransactionsPDF,
  downloadTransactionsExcel
} from '../controllers/closingStockController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All protected routes
router.use(authenticateToken);

// Closing stock
router.post('/calculate', calculateClosingStock);
router.get('/pdf', downloadClosingStockPDF);
router.get('/excel', downloadClosingStockExcel);

// Transactions
router.get('/transactions', getTransactions);
router.get('/transactions/pdf', downloadTransactionsPDF);
router.get('/transactions/excel', downloadTransactionsExcel);

export default router;
