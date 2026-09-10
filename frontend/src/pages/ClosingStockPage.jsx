import React, { useState } from 'react';
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
  Grid
} from '@mui/material';
import dayjs from 'dayjs';
import { closingStockAPI } from '../services/api';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

const ClosingStockPage = () => {
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    setError('');
    setReportData(null);
    setLoading(true);

    try {
      const response = await closingStockAPI.calculate({
        closingDate
      });
      setReportData((response.data && response.data.data) || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate closing stock report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await closingStockAPI.downloadPDF({ closingDate });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `closing-stock-${closingDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download PDF');
      console.error(err);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await closingStockAPI.downloadExcel({ closingDate });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `closing-stock-${closingDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download Excel');
      console.error(err);
    }
  };

  const calculateClosing = (product) => {
    return product.openingStock + product.stockIn - product.stockOut;
  };

  const totalStats = reportData ? {
    opening: reportData.products.reduce((sum, p) => sum + p.openingStock, 0),
    in: reportData.products.reduce((sum, p) => sum + p.stockIn, 0),
    out: reportData.products.reduce((sum, p) => sum + p.stockOut, 0)
  } : null;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Closing Stock
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Report Date
          </Typography>

          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Closing Date"
                value={closingDate}
                onChange={(e) => setClosingDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Generate'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Opening Stock
                    </Typography>
                    <Typography variant="h6">
                      {totalStats.opening}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Stock In
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      +{totalStats.in}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Stock Out
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'error.main' }}>
                      -{totalStats.out}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total Closing Stock
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {totalStats.opening + totalStats.in - totalStats.out}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveAltIcon />}
                  onClick={handleDownloadPDF}
                >
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SaveAltIcon />}
                  onClick={handleDownloadExcel}
                >
                  Export Excel
                </Button>
              </Box>
            </CardContent>
          </Card>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Category</TableCell>
                  <TableCell>Sub-Category</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Opening</TableCell>
                  <TableCell align="right">Stock In</TableCell>
                  <TableCell align="right">Stock Out</TableCell>
                  <TableCell align="right">Closing Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      No inventory data for the selected date
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData.products.map((product, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{product.subCategoryName}</TableCell>
                      <TableCell>{product.brandName}</TableCell>
                      <TableCell>{product.productName}</TableCell>
                      <TableCell>{product.unitCode}</TableCell>
                      <TableCell align="right">{product.openingStock}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        +{product.stockIn}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{product.stockOut}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {calculateClosing(product)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default ClosingStockPage;
