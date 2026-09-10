import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import StockInPage from './pages/StockInPage';
import StockOutPage from './pages/StockOutPage';
import CurrentStockPage from './pages/CurrentStockPage';
import TransactionsPage from './pages/TransactionsPage';
import ClosingStockPage from './pages/ClosingStockPage';
import ReportsPage from './pages/ReportsPage';
import ProductMasterPage from './pages/ProductMasterPage';
import SettingsPage from './pages/SettingsPage';
//import { authAPI } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a252f'
    },
    secondary: {
      main: '#27ae60',
      light: '#2ecc71'
    },
    background: {
      default: '#ecf0f1',
      paper: '#ffffff'
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#2c3e50'
    },
    h6: {
      fontWeight: 600,
      color: '#2c3e50'
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2c3e50',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: '8px'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '6px'
        }
      }
    }
  }
});

function ProtectedRoute({ children, isAuthenticated }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Layout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route path="/stock-in" element={<StockInPage />} />
                    <Route path="/stock-out" element={<StockOutPage />} />
                    <Route path="/current-stock" element={<CurrentStockPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/closing-stock" element={<ClosingStockPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/product-master" element={<ProductMasterPage />} />
                    {user?.role === 'ADMIN' && (
                      <>
                        <Route path="/settings" element={<SettingsPage />} />
                      </>
                    )}
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
