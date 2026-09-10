import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { productsAPI } from '../services/api';

const ProductMasterPage = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Category State
  const [categories, setCategories] = useState([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  
  // Sub-Category State
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryDialog, setSubCategoryDialog] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({ name: '', description: '', categoryId: '' });
  
  // Product State
  const [products, setProducts] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    categoryId: '',
    subCategoryId: '',
    minimumStockLevel: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [catRes, subCatRes, prodRes] = await Promise.all([
        productsAPI.getCategories(),
        productsAPI.getSubCategories(),
        productsAPI.getProducts()
      ]);
      
      setCategories((catRes.data && catRes.data.data) || []);
      setSubCategories((subCatRes.data && subCatRes.data.data) || []);
      setProducts((prodRes.data && prodRes.data.data) || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== CATEGORY HANDLERS =====
  const handleAddCategory = () => {
    setCategoryForm({ name: '', description: '' });
    setCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      await productsAPI.createCategory(categoryForm);
      setSuccess('Category created successfully');
      setCategoryDialog(false);
      loadAllData();
    } catch (err) {
      setError('Failed to create category');
    }
  };

  // ===== SUB-CATEGORY HANDLERS =====
  const handleAddSubCategory = () => {
    setSubCategoryForm({ name: '', description: '', categoryId: '' });
    setSubCategoryDialog(true);
  };

  const handleSaveSubCategory = async () => {
    if (!subCategoryForm.name.trim()) {
      setError('Sub-category name is required');
      return;
    }
    if (!subCategoryForm.categoryId) {
      setError('Please select a category');
      return;
    }
    try {
      await productsAPI.createSubCategory(subCategoryForm);
      setSuccess('Sub-category created successfully');
      setSubCategoryDialog(false);
      loadAllData();
    } catch (err) {
      setError('Failed to create sub-category');
    }
  };

  // ===== PRODUCT HANDLERS =====
  const handleAddProduct = () => {
    setProductForm({
      name: '',
      code: '',
      categoryId: '',
      subCategoryId: '',
      minimumStockLevel: 0
    });
    setProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.code.trim()) {
      setError('Product name and SKU are required');
      return;
    }
    if (!productForm.categoryId || !productForm.subCategoryId) {
      setError('Please select category and sub-category');
      return;
    }
    try {
      await productsAPI.createProduct(productForm);
      setSuccess('Product created successfully');
      setProductDialog(false);
      loadAllData();
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Product Master
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Categories" />
            <Tab label="Sub-Categories" />
            <Tab label="Products" />
          </Tabs>
        </Box>

        <CardContent>
          {/* CATEGORIES TAB */}
          {tabValue === 0 && (
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCategory}
                sx={{ mb: 2 }}
              >
                Add Category
              </Button>
              
              {loading ? (
                <Typography>Loading...</Typography>
              ) : categories.length === 0 ? (
                <Typography>No categories yet. Click "Add Category" to create one.</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map(cat => (
                        <TableRow key={cat._id}>
                          <TableCell>{cat.name}</TableCell>
                          <TableCell>{cat.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* SUB-CATEGORIES TAB */}
          {tabValue === 1 && (
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddSubCategory}
                sx={{ mb: 2 }}
              >
                Add Sub-Category
              </Button>
              
              {loading ? (
                <Typography>Loading...</Typography>
              ) : subCategories.length === 0 ? (
                <Typography>No sub-categories yet. Click "Add Sub-Category" to create one.</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subCategories.map(subCat => {
                        const category = categories.find(c => c._id === subCat.categoryId);
                        return (
                          <TableRow key={subCat._id}>
                            <TableCell>{subCat.name}</TableCell>
                            <TableCell>{category?.name || '-'}</TableCell>
                            <TableCell>{subCat.description || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {/* PRODUCTS TAB */}
          {tabValue === 2 && (
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                sx={{ mb: 2 }}
              >
                Add Product
              </Button>
              
              {loading ? (
                <Typography>Loading...</Typography>
              ) : products.length === 0 ? (
                <Typography>No products yet. Click "Add Product" to create one.</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sub-Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Min Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map(prod => {
                        const category = categories.find(c => c._id === prod.categoryId);
                        const subCategory = subCategories.find(sc => sc._id === prod.subCategoryId);
                        return (
                          <TableRow key={prod._id}>
                            <TableCell>{prod.name}</TableCell>
                            <TableCell>{prod.code}</TableCell>
                            <TableCell>{category?.name || '-'}</TableCell>
                            <TableCell>{subCategory?.name || '-'}</TableCell>
                            <TableCell>{prod.minimumStockLevel}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CATEGORY DIALOG */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Description"
            value={categoryForm.description}
            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            margin="normal"
            size="small"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* SUB-CATEGORY DIALOG */}
      <Dialog open={subCategoryDialog} onClose={() => setSubCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Sub-Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={subCategoryForm.categoryId}
              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, categoryId: e.target.value })}
              label="Category"
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Sub-Category Name"
            value={subCategoryForm.name}
            onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Description"
            value={subCategoryForm.description}
            onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
            margin="normal"
            size="small"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubCategoryDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSubCategory} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* PRODUCT DIALOG */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Product</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="SKU / Code"
            value={productForm.code}
            onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
            margin="normal"
            size="small"
          />
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={productForm.categoryId}
              onChange={(e) => {
                setProductForm({ ...productForm, categoryId: e.target.value, subCategoryId: '' });
              }}
              label="Category"
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" size="small" disabled={!productForm.categoryId}>
            <InputLabel>Sub-Category</InputLabel>
            <Select
              value={productForm.subCategoryId}
              onChange={(e) => setProductForm({ ...productForm, subCategoryId: e.target.value })}
              label="Sub-Category"
            >
              <MenuItem value="">Select Sub-Category</MenuItem>
              {subCategories
                .filter(sc => sc.categoryId === productForm.categoryId)
                .map(sc => (
                  <MenuItem key={sc._id} value={sc._id}>{sc.name}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Minimum Stock Level"
            type="number"
            value={productForm.minimumStockLevel}
            onChange={(e) => setProductForm({ ...productForm, minimumStockLevel: parseInt(e.target.value) || 0 })}
            margin="normal"
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductMasterPage;
