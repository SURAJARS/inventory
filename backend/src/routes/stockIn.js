import express from 'express';
import {
  createStockIn,
  getStockInHistory,
  getStockInById
} from '../controllers/stockInController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// All protected routes
router.use(authenticateToken);

router.post('/', createStockIn);
router.get('/history', getStockInHistory);
router.get('/:id', getStockInById);

export default router;
