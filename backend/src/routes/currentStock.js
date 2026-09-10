import express from 'express';
import {
  getCurrentStockAll,
  getCurrentStockByProduct,
  searchProducts
} from '../controllers/currentStockController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All protected routes
router.use(authenticateToken);

router.get('/', getCurrentStockAll);
router.get('/product/:id', getCurrentStockByProduct);
router.get('/search', searchProducts);

export default router;
