import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import dayjs from 'dayjs';
import { closingStockAPI, productsAPI } from '../services/api';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    transactionType: '',
    categoryId: '',
    startDate: '',
    endDate: ''
  });

  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTransactions();
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters.page, filters.transactionType, filters.categoryId, filters.startDate, filters.endDate]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        transactionType: filters.transactionType || undefined,
        categoryId: filters.categoryId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key =>
        queryParams[key] === undefined && delete queryParams[key]
      );

      const response = await closingStockAPI.getTransactions(queryParams);
      setTransactions((response.data && response.data.data) || []);
      setTotalPages((response.data && response.data.pagination && response.data.pagination.pages) || 0);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const catRes = await productsAPI.getCategories();
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error('Failed to load filter options');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      transactionType: '',
      categoryId: '',
      startDate: '',
      endDate: ''
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inventory Transactions
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="transactionType"
                  value={filters.transactionType}
                  onChange={handleFilterChange}
                  label="Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="STOCK_IN">Stock In</MenuItem>
                  <MenuItem value="STOCK_OUT">Stock Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell>Performed By</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map(txn => (
                    <TableRow key={txn._id}>
                      <TableCell>{dayjs(txn.transactionDate).format('DD-MM-YYYY HH:mm')}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.85rem',
                            backgroundColor: txn.transactionType === 'STOCK_IN' ? '#c8e6c9' : '#ffcdd2',
                            color: txn.transactionType === 'STOCK_IN' ? '#1b5e20' : '#b71c1c'
                          }}
                        >
                          {txn.transactionType === 'STOCK_IN' ? 'IN' : 'OUT'}
                        </Box>
                      </TableCell>
                      <TableCell>{txn.categoryId?.name}</TableCell>
                      <TableCell>{txn.productId?.name}</TableCell>
                      <TableCell align="right">{txn.quantity}</TableCell>
                      <TableCell>{txn.performedBy?.fullName || 'N/A'}</TableCell>
                      <TableCell>{txn.remarks || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={filters.page}
                onChange={(e, newPage) => setFilters(prev => ({ ...prev, page: newPage }))}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default TransactionsPage;
