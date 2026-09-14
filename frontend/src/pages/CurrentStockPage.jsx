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
  const [subCategories, setSubCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    subCategoryId: ''
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

    if (filters.subCategoryId) {
      result = result.filter(
        (item) => String(item.subCategoryId) === String(filters.subCategoryId)
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
      const [catRes, subCatRes] = await Promise.all([
        productsAPI.getCategories(),
        productsAPI.getSubCategories()
      ]);

      setCategories(
        (catRes.data && catRes.data.data) || []
      );
      setSubCategories(
        (subCatRes.data && subCatRes.data.data) || []
      );
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'categoryId') {
      // When category changes, reset sub-category and reload sub-categories for that category
      setFilters((prev) => ({
        ...prev,
        categoryId: value,
        subCategoryId: '' // Reset sub-category
      }));

      // Reload sub-categories for the selected category
      loadSubCategoriesForCategory(value);
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const loadSubCategoriesForCategory = async (categoryId) => {
    try {
      if (categoryId) {
        // Load sub-categories for the selected category
        const res = await productsAPI.getSubCategories({ categoryId });
        setSubCategories((res.data && res.data.data) || []);
      } else {
        // Load all sub-categories if no category selected
        const res = await productsAPI.getSubCategories();
        setSubCategories((res.data && res.data.data) || []);
      }
    } catch (err) {
      console.error('Failed to load sub-categories', err);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      subCategoryId: ''
    });
    // Reload all sub-categories
    loadSubCategoriesForCategory('');
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

            <Grid item xs={12} sm={6} md={2}>
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

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sub-Category</InputLabel>

                <Select
                  name="subCategoryId"
                  value={filters.subCategoryId}
                  onChange={handleFilterChange}
                  label="Sub-Category"
                >
                  <MenuItem value="">
                    All Sub-Categories
                  </MenuItem>

                  {subCategories.map((subCat) => (
                    <MenuItem
                      key={subCat._id}
                      value={subCat._id}
                    >
                      {subCat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
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
    <TableCell>Sub-Category</TableCell>
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
                    colSpan={6}
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
    {item.subCategory || '-'}
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