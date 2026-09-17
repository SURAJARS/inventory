import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
//import dayjs from 'dayjs';
import { stockOutAPI, productsAPI, currentStockAPI } from '../services/api';

const StockOutPage = () => {
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    subCategoryId: '',
    productId: '',
    quantity: '',
    remarks: '',
    referenceNumber: ''
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentStock, setCurrentStock] = useState(0);

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  /*useEffect(() => {
  if (formData.categoryId) {
    loadSubCategories(formData.categoryId);
  }
}, [formData.categoryId, loadSubCategories]);*/

  useEffect(() => {
    loadHistory(1);
  }, []);

  /*useEffect(() => {
  if (formData.productId) {
    loadProductStock();
  }
}, [formData.productId, loadProductStock]);*/

  const loadInitialData = async () => {
    try {
      const catRes = await productsAPI.getCategories();
      setCategories((catRes.data && catRes.data.data) || []);
    } catch (err) {
      setError('Failed to load initial data');
    }
  };

  const loadProducts = useCallback(async (categoryId, subCategoryId = '') => {
  try {
    const params = { categoryId };
    if (subCategoryId) {
      params.subCategoryId = subCategoryId;
    }
    const res = await productsAPI.getProducts(params);
    setProducts((res.data && res.data.data) || []);
  } catch (err) {
    setError('Failed to load products');
  }
}, []);

  const loadSubCategories = useCallback(async (categoryId) => {
  try {
    const res = await productsAPI.getSubCategories({ categoryId });
    setSubCategories((res.data && res.data.data) || []);
    setFormData(prev => ({ ...prev, subCategoryId: '', productId: '' }));
    loadProducts(categoryId);
  } catch (err) {
    setError('Failed to load subcategories');
  }
}, [loadProducts]);

  

 const loadProductStock = useCallback(async () => {
  try {
    const res = await currentStockAPI.getByProduct(formData.productId);
    setCurrentStock(res.data.data.currentStock || 0);
  } catch (err) {
    console.error('Failed to load product stock');
    setCurrentStock(0);
  }
}, [formData.productId]);

useEffect(() => {
  if (formData.categoryId) {
    loadSubCategories(formData.categoryId);
  }
}, [formData.categoryId, loadSubCategories]);

useEffect(() => {
  if (formData.subCategoryId && formData.categoryId) {
    loadProducts(formData.categoryId, formData.subCategoryId);
  }
}, [formData.subCategoryId, formData.categoryId, loadProducts]);

useEffect(() => {
  if (formData.productId) {
    loadProductStock();
  }
}, [formData.productId, loadProductStock]);

  const loadHistory = async (pageNum) => {
    try {
      const res = await stockOutAPI.getHistory({ page: pageNum, limit: 10 });
      setHistory((res.data && res.data.data) || []);
      setTotalPages((res.data && res.data.pagination && res.data.pagination.pages) || 0);
      setPage(pageNum);
      setError(''); // Clear error on successful load
    } catch (err) {
      console.error('Failed to load history:', err);
      setError('Failed to load history');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.productId || !formData.quantity) {
        setError('Product and quantity are required');
        setLoading(false);
        return;
      }

      const quantity = parseFloat(formData.quantity);
      if (quantity > currentStock) {
        setError(`Insufficient stock. Available: ${currentStock}`);
        setLoading(false);
        return;
      }

      const data = {
        ...formData,
        quantity
      };

      await stockOutAPI.create(data);
      setSuccess('Stock Out recorded successfully');
      
      // Reset form
      setFormData({
        transactionDate: new Date().toISOString().split('T')[0],
        categoryId: '',
        subCategoryId: '',
        productId: '',
        quantity: '',
        remarks: '',
        referenceNumber: ''
      });
      setCurrentStock(0);

      loadHistory(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record stock out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Stock Out
      </Typography>

      <Grid container spacing={3}>
        {/* Form - Takes full width on mobile, 70% on desktop */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                📤 Record Stock Out
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Transaction Date"
                      name="transactionDate"
                      value={formData.transactionDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      required
                      disabled={loading}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required disabled={loading} size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        label="Category"
                      >
                        <MenuItem value="">Select Category</MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.categoryId && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required disabled={loading} size="small">
                        <InputLabel>Sub-Category</InputLabel>
                        <Select
                          name="subCategoryId"
                          value={formData.subCategoryId}
                          onChange={handleChange}
                          label="Sub-Category"
                        >
                          <MenuItem value="">Select Sub-Category</MenuItem>
                          {subCategories.map(subCat => (
                            <MenuItem key={subCat._id} value={subCat._id}>{subCat.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}



                  {formData.categoryId && (
                    <Grid item xs={12}>
                      <FormControl fullWidth required disabled={loading} size="small">
                        <InputLabel>Product</InputLabel>
                        <Select
                          name="productId"
                          value={formData.productId}
                          onChange={handleChange}
                          label="Product"
                        >
                          <MenuItem value="">Select Product</MenuItem>
                          {products.map(prod => (
                            <MenuItem key={prod._id} value={prod._id}>{prod.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.productId && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={`Available Stock (${products.find(p => p._id === formData.productId)?.unitId?.code || 'units'})`}
                        value={currentStock}
                        disabled
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root.Mui-disabled': {
                            backgroundColor: currentStock < 10 ? '#fff3e0' : '#ecf0f1',
                            fontWeight: 600
                          }
                        }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Quantity to Issue"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      inputProps={{ step: '0.01' }}
                      size="small"
                    />
                  </Grid>



                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reference Number"
                      name="referenceNumber"
                      value={formData.referenceNumber}
                      onChange={handleChange}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      disabled={loading}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      disabled={loading}
                      sx={{ py: 1.5, fontWeight: 600 }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : '✓ Save Stock Out'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* History - Takes full width on mobile, 30% on desktop */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                📋 Recent Stock Out
              </Typography>

              {history.length === 0 ? (
                <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
                  No stock out records yet
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#ecf0f1' }}>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: '#ecf0f1' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, backgroundColor: '#ecf0f1' }}>Product</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#ecf0f1' }}>Qty</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((item, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {new Date(item.transactionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>
                            {item.productId?.name || 'N/A'}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#e74c3c' }}>
                            {item.quantity} {item.unitId?.code || ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {totalPages > 1 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, newPage) => loadHistory(newPage)}
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockOutPage;
