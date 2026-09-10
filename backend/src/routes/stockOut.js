import express from 'express';
import {
  createStockOut,
  getStockOutHistory,
  getStockOutById
} from '../controllers/stockOutController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// All protected routes
router.use(authenticateToken);

router.post('/', createStockOut);
router.get('/history', getStockOutHistory);
router.get('/:id', getStockOutById);

export default router;
