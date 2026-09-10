import express from 'express';
import {
  setOpeningStock,
  getOpeningStock,
  getAllOpeningStocks
} from '../controllers/openingStockController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// All protected routes
router.use(authenticateToken);

// Only ADMIN can set opening stock
router.post('/', checkRole(['ADMIN']), setOpeningStock);
router.get('/all', checkRole(['ADMIN']), getAllOpeningStocks);
router.get('/:productId', getOpeningStock);

export default router;
