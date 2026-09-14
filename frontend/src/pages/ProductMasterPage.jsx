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
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', isActive: true });
  
  // Sub-Category State
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryDialog, setSubCategoryDialog] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({ name: '', description: '', categoryId: '', isActive: true });
  
  // Product State
  const [products, setProducts] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    categoryId: '',
    subCategoryId: '',
    brand: '',
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  
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
    setCategoryForm({ name: '', description: '', isActive: true });
    setEditingId(null);
    setCategoryDialog(true);
  };

  const handleEditCategory = (cat) => {
    setCategoryForm(cat);
    setEditingId(cat._id);
    setCategoryDialog(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await productsAPI.updateCategory(id, { isActive: false });
        setSuccess('Category deleted successfully');
        loadAllData();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete category';
        setError(errorMessage);
      }
    }
  };

  const handleToggleCategoryStatus = async (id, isActive) => {
    try {
      await productsAPI.updateCategory(id, { isActive });
      setSuccess(`Category ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadAllData();
    } catch (err) {
      setError('Failed to update category status');
    }
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
    setSubCategoryForm({ name: '', description: '', categoryId: '', isActive: true });
    setEditingId(null);
    setSubCategoryDialog(true);
  };

  const handleEditSubCategory = (subCat) => {
    setSubCategoryForm({
      ...subCat,
      categoryId: typeof subCat.categoryId === 'object' ? subCat.categoryId._id : subCat.categoryId
    });
    setEditingId(subCat._id);
    setSubCategoryDialog(true);
  };

  const handleDeleteSubCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-category?')) {
      try {
        await productsAPI.deleteSubCategory(id);
        setSuccess('Sub-category deleted successfully');
        loadAllData();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete sub-category';
        setError(errorMessage);
      }
    }
  };

  const handleToggleSubCategoryStatus = async (id, isActive) => {
    try {
      await productsAPI.updateSubCategory(id, { isActive });
      setSuccess(`Sub-category ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadAllData();
    } catch (err) {
      setError('Failed to update sub-category status');
    }
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
      const dataToSave = {
        ...subCategoryForm,
        categoryId: typeof subCategoryForm.categoryId === 'object' ? subCategoryForm.categoryId._id : subCategoryForm.categoryId
      };
      if (editingId) {
        // Update existing
        await productsAPI.updateSubCategory(editingId, dataToSave);
        setSuccess('Sub-category updated successfully');
      } else {
        // Create new
        await productsAPI.createSubCategory(dataToSave);
        setSuccess('Sub-category created successfully');
      }
      setSubCategoryDialog(false);
      loadAllData();
    } catch (err) {
      setError(editingId ? 'Failed to update sub-category' : 'Failed to create sub-category');
      console.error(err);
    }
  };

  // ===== PRODUCT HANDLERS =====
  const handleAddProduct = () => {
    setProductForm({
      name: '',
      code: '',
      categoryId: '',
      subCategoryId: '',
      brand: '',
      isActive: true
    });
    setEditingId(null);
    setProductDialog(true);
  };

  const handleEditProduct = (prod) => {
    setProductForm({
      ...prod,
      categoryId: typeof prod.categoryId === 'object' ? prod.categoryId._id : prod.categoryId,
      subCategoryId: typeof prod.subCategoryId === 'object' ? prod.subCategoryId._id : prod.subCategoryId,
      brand: prod.brand || ''
    });
    setEditingId(prod._id);
    setProductDialog(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(id);
        setSuccess('Product deleted successfully');
        loadAllData();
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete product';
        setError(errorMessage);
      }
    }
  };

  const handleToggleProductStatus = async (id, isActive) => {
    try {
      await productsAPI.updateProduct(id, { isActive });
      setSuccess(`Product ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadAllData();
    } catch (err) {
      setError('Failed to update product status');
    }
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
      const dataToSave = {
        ...productForm,
        categoryId: typeof productForm.categoryId === 'object' ? productForm.categoryId._id : productForm.categoryId,
        subCategoryId: typeof productForm.subCategoryId === 'object' ? productForm.subCategoryId._id : productForm.subCategoryId
      };
      if (editingId) {
        // Update existing
        await productsAPI.updateProduct(editingId, dataToSave);
        setSuccess('Product updated successfully');
      } else {
        // Create new
        await productsAPI.createProduct(dataToSave);
        setSuccess('Product created successfully');
      }
      setProductDialog(false);
      loadAllData();
    } catch (err) {
      setError(editingId ? 'Failed to update product' : 'Failed to create product');
      console.error(err);
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
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map(cat => (
                        <TableRow key={cat._id}>
                          <TableCell>{cat.name}</TableCell>
                          <TableCell>{cat.description || '-'}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant={cat.isActive === false ? 'outlined' : 'contained'}
                              color={cat.isActive === false ? 'error' : 'success'}
                              onClick={() => handleToggleCategoryStatus(cat._id, !cat.isActive)}
                            >
                              {cat.isActive === false ? 'Inactive' : 'Active'}
                            </Button>
                          </TableCell>
                          <TableCell align="center">
                            <Button size="small" onClick={() => handleEditCategory(cat)}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDeleteCategory(cat._id)}>Delete</Button>
                          </TableCell>
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
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subCategories.map(subCat => {
                        const catId = typeof subCat.categoryId === 'object' ? subCat.categoryId?._id : subCat.categoryId;
                        const category = categories.find(c => String(c._id) === String(catId));
                        return (
                          <TableRow key={subCat._id}>
                            <TableCell>{category?.name || '-'}</TableCell>
                            <TableCell>{subCat.name}</TableCell>
                            <TableCell>{subCat.description || '-'}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant={subCat.isActive === false ? 'outlined' : 'contained'}
                                color={subCat.isActive === false ? 'error' : 'success'}
                                onClick={() => handleToggleSubCategoryStatus(subCat._id, !subCat.isActive)}
                              >
                                {subCat.isActive === false ? 'Inactive' : 'Active'}
                              </Button>
                            </TableCell>
                            <TableCell align="center">
                              <Button size="small" onClick={() => handleEditSubCategory(subCat)}>Edit</Button>
                              <Button size="small" color="error" onClick={() => handleDeleteSubCategory(subCat._id)}>Delete</Button>
                            </TableCell>
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
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Sub-Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Brand</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map(prod => {
                        const catId = typeof prod.categoryId === 'object' ? prod.categoryId?._id : prod.categoryId;
                        const subCatId = typeof prod.subCategoryId === 'object' ? prod.subCategoryId?._id : prod.subCategoryId;
                        const category = categories.find(c => String(c._id) === String(catId));
                        const subCategory = subCategories.find(sc => String(sc._id) === String(subCatId));
                        return (
                          <TableRow key={prod._id}>
                            <TableCell>{category?.name || '-'}</TableCell>
                            <TableCell>{subCategory?.name || '-'}</TableCell>
                            <TableCell>{prod.brand || '-'}</TableCell>
                            <TableCell>{prod.name}</TableCell>
                            <TableCell>{prod.code}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                variant={prod.isActive === false ? 'outlined' : 'contained'}
                                color={prod.isActive === false ? 'error' : 'success'}
                                onClick={() => handleToggleProductStatus(prod._id, !prod.isActive)}
                              >
                                {prod.isActive === false ? 'Inactive' : 'Active'}
                              </Button>
                            </TableCell>
                            <TableCell align="center">
                              <Button size="small" onClick={() => handleEditProduct(prod)}>Edit</Button>
                              <Button size="small" color="error" onClick={() => handleDeleteProduct(prod._id)}>Delete</Button>
                            </TableCell>
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
                .filter(sc => {
                  const scCategoryId = sc.categoryId && sc.categoryId._id ? String(sc.categoryId._id) : String(sc.categoryId);
                  return scCategoryId === productForm.categoryId;
                })
                .map(sc => (
                  <MenuItem key={sc._id} value={sc._id}>{sc.name}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Brand"
            value={productForm.brand}
            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
            margin="normal"
            size="small"
            placeholder="e.g., Ibery, Amul, Aavin, Milky Mist"
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
