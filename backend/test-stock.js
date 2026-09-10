import jwt from 'jsonwebtoken';
import axios from 'axios';

// Create a valid token
const token = jwt.sign(
  { id: '6aa26d3a8c56931d5c44bf4f', role: 'ADMIN' },
  'kannan-stores-inventory-secret-key-change-in-production',
  { expiresIn: '7d' }
);

console.log('Created token:', token);

// Test the getCurrentStock API
const productId = '6aa27eeef9cb1517a3cbeace';
const url = `http://localhost:5000/api/current-stock/product/${productId}`;

console.log('\nTesting getCurrentStock API:');
console.log('URL:', url);
console.log('ProductId:', productId);
console.log('');

axios.get(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => {
    console.log('✅ SUCCESS - Response:');
    console.log(JSON.stringify(response.data, null, 2));
  })
  .catch(error => {
    console.log('❌ ERROR:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Message:', error.message);
    }
  });
