import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import {  currentStockAPI } from '../services/api';
//import dayjs from 'dayjs';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayStockIn: 0,
    todayStockOut: 0,
    currentStockItems: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get current stock to count items and low stock
      const stockResponse = await currentStockAPI.getAll();
      const allProducts = (stockResponse.data && stockResponse.data.data) || [];
      
      setStats({
        todayStockIn: 0, // Would need to fetch from API
        todayStockOut: 0, // Would need to fetch from API
        currentStockItems: allProducts.length,
        lowStockItems: allProducts.filter(p => p.isLowStock).length
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Stock In
              </Typography>
              <Typography variant="h5">{stats.todayStockIn}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Stock Out
              </Typography>
              <Typography variant="h5">{stats.todayStockOut}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Stock Items
              </Typography>
              <Typography variant="h5">{stats.currentStockItems}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h5" sx={{ color: stats.lowStockItems > 0 ? 'warning.main' : 'success.main' }}>
                {stats.lowStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/stock-in')}
            >
              Stock In
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/stock-out')}
            >
              Stock Out
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/current-stock')}
            >
              View Current Stock
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/closing-stock')}
            >
              Closing Stock
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
