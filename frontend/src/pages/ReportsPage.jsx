import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  Grid,
  Tab,
  Tabs
} from '@mui/material';
import dayjs from 'dayjs';
import { closingStockAPI } from '../services/api';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ReportsPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

  // Closing Stock Report
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split('T')[0]);

  // Transaction Report
  const [startDate, setStartDate] = useState(
    dayjs().subtract(30, 'days').toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleClosingStockPDF = async () => {
    setError('');
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
      setError('Failed to download closing stock PDF');
      console.error(err);
    }
  };

  const handleClosingStockExcel = async () => {
    setError('');
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
      setError('Failed to download closing stock Excel');
      console.error(err);
    }
  };

  const handleTransactionPDF = async () => {
    setError('');
    try {
      const response = await closingStockAPI.downloadTransactionsPDF({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${startDate}-to-${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download transaction PDF');
      console.error(err);
    }
  };

  const handleTransactionExcel = async () => {
    setError('');
    try {
      const response = await closingStockAPI.downloadTransactionsExcel({ startDate, endDate });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${startDate}-to-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download transaction Excel');
      console.error(err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Closing Stock Report" id="tab-0" />
            <Tab label="Transaction Report" id="tab-1" />
          </Tabs>
        </Box>

        {/* Closing Stock Report */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Closing Stock Report
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Report Date"
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
                startIcon={<SaveAltIcon />}
                onClick={handleClosingStockPDF}
              >
                PDF
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveAltIcon />}
                onClick={handleClosingStockExcel}
              >
                Excel
              </Button>
            </Grid>
          </Grid>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Generate closing stock report for the selected date. The report will include opening stock,
            stock in, stock out, and calculated closing stock for all products.
          </Typography>
        </TabPanel>

        {/* Transaction Report */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Transaction Report
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveAltIcon />}
                onClick={handleTransactionPDF}
              >
                PDF
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveAltIcon />}
                onClick={handleTransactionExcel}
              >
                Excel
              </Button>
            </Grid>
          </Grid>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
            Generate transaction report for the selected date range. The report will include all
            stock in and stock out transactions.
          </Typography>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default ReportsPage;
