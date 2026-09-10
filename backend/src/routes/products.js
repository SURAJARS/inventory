import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getBrands,
  createBrand,
  updateBrand,
  getUnits,
  createUnit,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById
} from '../controllers/productController.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// All protected routes
router.use(authenticateToken);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);

// Sub-categories
router.get('/subcategories', getSubCategories);
router.post('/subcategories', createSubCategory);
router.put('/subcategories/:id', updateSubCategory);
router.delete('/subcategories/:id', deleteSubCategory);

// Brands
router.get('/brands', getBrands);
router.post('/brands', createBrand);
router.put('/brands/:id', updateBrand);

// Units
router.get('/units', getUnits);
router.post('/units', createUnit);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

export default router;
