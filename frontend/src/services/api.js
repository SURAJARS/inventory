import axios from 'axios';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://inventory-wtys.onrender.com/api'
    : 'http://localhost:5000/api';
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

// Products API
export const productsAPI = {
  getCategories: (params) => api.get('/products/categories', { params }),
  createCategory: (data) => api.post('/products/categories', data),
  updateCategory: (id, data) => api.put(`/products/categories/${id}`, data),

  getSubCategories: (params) => api.get('/products/subcategories', { params }),
  createSubCategory: (data) => api.post('/products/subcategories', data),
  updateSubCategory: (id, data) => api.put(`/products/subcategories/${id}`, data),
  deleteSubCategory: (id) => api.delete(`/products/subcategories/${id}`),

  getBrands: (params) => api.get('/products/brands', { params }),
  createBrand: (data) => api.post('/products/brands', data),
  updateBrand: (id, data) => api.put(`/products/brands/${id}`, data),

  getUnits: (params) => api.get('/products/units', { params }),
  createUnit: (data) => api.post('/products/units', data),

  getProducts: (params) => api.get('/products/products', { params }),
  getProductById: (id) => api.get(`/products/products/${id}`),
  createProduct: (data) => api.post('/products/products', data),
  updateProduct: (id, data) => api.put(`/products/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/products/${id}`)
};

// Stock In API
export const stockInAPI = {
  create: (data) => api.post('/stock-in', data),
  getHistory: (params) => api.get('/stock-in/history', { params }),
  getById: (id) => api.get(`/stock-in/${id}`)
};

// Stock Out API
export const stockOutAPI = {
  create: (data) => api.post('/stock-out', data),
  getHistory: (params) => api.get('/stock-out/history', { params }),
  getById: (id) => api.get(`/stock-out/${id}`)
};

// Current Stock API
export const currentStockAPI = {
  getAll: (params) => api.get('/current-stock', { params }),
  getByProduct: (id) => api.get(`/current-stock/product/${id}`),
  search: (params) => api.get('/current-stock/search', { params })
};

// Closing Stock API
export const closingStockAPI = {
  calculate: (data) => api.post('/closing-stock/calculate', data),
  downloadPDF: (params) => api.get('/closing-stock/pdf', { params, responseType: 'blob' }),
  downloadExcel: (params) => api.get('/closing-stock/excel', { params, responseType: 'blob' }),
  getTransactions: (params) => api.get('/closing-stock/transactions', { params }),
  downloadTransactionsPDF: (params) => api.get('/closing-stock/transactions/pdf', { params, responseType: 'blob' }),
  downloadTransactionsExcel: (params) => api.get('/closing-stock/transactions/excel', { params, responseType: 'blob' })
};

// Opening Stock API
export const openingStockAPI = {
  set: (data) => api.post('/opening-stock', data),
  getAll: () => api.get('/opening-stock/all'),
  getByProduct: (id) => api.get(`/opening-stock/${id}`)
};

export default api;
