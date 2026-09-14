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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { currentStockAPI, productsAPI } from '../services/api';

const CurrentStockPage = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    categoryId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
    loadFilterOptions();
  }, []);

  // Apply filters whenever stock data or filter values change
  useEffect(() => {
    let result = stockData;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();

      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.categoryId) {
      result = result.filter(
        (item) => String(item.categoryId) === String(filters.categoryId)
      );
    }

    setFilteredData(result);
  }, [stockData, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await currentStockAPI.getAll();

      setStockData(
        (response.data && response.data.data) || []
      );
    } catch (err) {
      setError('Failed to load current stock');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const catRes = await productsAPI.getCategories();

      setCategories(
        (catRes.data && catRes.data.data) || []
      );
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryId: ''
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Current Stock
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search by name or code"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1 }} />
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>

                <Select
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  label="Category"
                >
                  <MenuItem value="">
                    All Categories
                  </MenuItem>

                  {categories.map((cat) => (
                    <MenuItem
                      key={cat._id}
                      value={cat._id}
                    >
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 4
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: '#f5f5f5'
                }}
              >
                <TableCell>Category</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell align="right">
                  Current Stock
                </TableCell>
                <TableCell align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    No stock data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      {item.category}
                    </TableCell>

                    <TableCell>
                      {item.name}
                    </TableCell>

                    <TableCell>
                      {item.code || '-'}
                    </TableCell>

                    <TableCell align="right">
                      {item.currentStock}
                    </TableCell>

                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: item.isLowStock
                            ? '#ffebee'
                            : '#e8f5e9',
                          color: item.isLowStock
                            ? '#c62828'
                            : '#2e7d32'
                        }}
                      >
                        {item.isLowStock ? 'Low' : 'OK'}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default CurrentStockPage;