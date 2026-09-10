import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';

const Layout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Stock In', path: '/stock-in' },
    { label: 'Stock Out', path: '/stock-out' },
    { label: 'Current Stock', path: '/current-stock' },
    { label: 'Transactions', path: '/transactions' },
    { label: 'Closing Stock', path: '/closing-stock' },
    { label: 'Reports', path: '/reports' },
    { label: 'Product Master', path: '/product-master' },
    ...(user?.role === 'ADMIN' ? [{ label: 'Settings', path: '/settings' }] : [])
  ];

  const drawer = (
    <Box sx={{ width: 280 }}>
      <Box sx={{ p: 2, bgcolor: '#2c3e50', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Kannan Stores
        </Typography>
        <Typography variant="body2">{user?.fullName || 'User'}</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <Divider />
        <ListItem button onClick={onLogout} sx={{ '&:hover': { bgcolor: '#ffebee' } }}>
          <ListItemText primary="Logout" sx={{ color: '#c62828' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Fixed AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          bgcolor: '#2c3e50',
          zIndex: 1300
        }}
      >
        <Toolbar>
          <Button
            onClick={handleMenuToggle}
            sx={{ display: { xs: 'block', md: 'none' }, color: 'white', mr: 2 }}
          >
            <MenuIcon />
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Kannan Stores - Inventory Management
          </Typography>
          <Typography variant="body2" sx={{ mr: 3 }}>
            {user?.fullName}
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleMenuToggle}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            bgcolor: '#ffffff',
            borderRight: '1px solid #e0e0e0',
            pt: 8,
            zIndex: 1200
          }
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          pt: 8,
          bgcolor: '#ecf0f1'
        }}
      >
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
