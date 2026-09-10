# KANNAN STORES - QUICK START GUIDE

## System Requirements

- Node.js 18.x or higher
- MongoDB (local, Docker, or Atlas)
- npm or yarn

Both Node.js dependencies are already installed ✅

---

## MongoDB Setup (Choose ONE Option)

### ✅ OPTION 1: MongoDB Community Edition (Recommended for Local Development)

**Windows Installation:**

1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows Service
4. Verify it's running: `mongosh` command should connect to local database
5. **Default connection:** `mongodb://localhost:27017/kannan-inventory` ✅ (Already configured in `.env`)

**Verify MongoDB is Running:**

```powershell
mongosh
# You should see: test> (MongoDB shell prompt)
# Type: exit
```

---

### OPTION 2: MongoDB Atlas (Cloud - No Local Installation)

**Setup (5 minutes):**

1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster (free tier available)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/kannan-inventory?retryWrites=true&w=majority`
5. Update `.env` file with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kannan-inventory
   ```

---

### OPTION 3: Docker Compose (If Docker Desktop is Running)

**Requirements:** Docker Desktop must be installed and running with WSL2 backend

**Commands:**

```powershell
cd "c:\Users\SURAJ ARS\Documents\innovations\inventory"
docker-compose up -d
docker-compose ps  # Verify MongoDB is running
```

---

## Start the Application

**Terminal 1 - Start Backend (Port 5000):**

```powershell
cd backend
npm start
```

Expected output:

```
✓ MongoDB connected successfully
✓ Server running on port 5000
```

---

**Terminal 2 - Start Frontend (Port 3000):**

```powershell
cd frontend
npm start
```

Expected output:

```
webpack compiled successfully
Compiled successfully!
You can now view kannan-stores-inventory in the browser.
  Local: http://localhost:3000
```

The browser should open automatically. If not, visit: http://localhost:3000

---

## Test the Application

### 1. **Register New User**

- Click "Register"
- Fill in: Full Name, Username, Email, Password
- Click "Register"

### 2. **Login**

- Username/Email: (use registered credentials)
- Password: (use registered password)
- Click "Login"

### 3. **Setup Master Data** (ADMIN only)

- Click "Product Master" (top menu)
- **Tab 1 - Categories:** Add "Grocery"
- **Tab 2 - Sub-Categories:** Select "Grocery", Add "Rice"
- **Tab 3 - Brands:** Add "Brand A"
- **Tab 4 - Units:** Add "KG" (code: KG)
- **Tab 5 - Products:**
  - Name: "Basmati Rice"
  - Category: "Grocery"
  - Sub-Category: "Rice"
  - Brand: "Brand A"
  - Unit: "KG"
  - Min Stock: "10"
  - Click "Add Product"

### 4. **Test Stock Operations**

**Set Opening Stock:**

- Menu → "Stock In"
- Date: (today)
- Product: "Basmati Rice"
- Quantity: 100
- Click "Submit"
- ✓ Opening stock set to 100 KG

**Stock In:**

- Add 50 KG more
- Expected: Current Stock = 150 KG

**Stock Out:**

- Remove 30 KG
- Expected: Current Stock = 120 KG
- (Note: Can't remove more than available - backend validation)

**Current Stock Page:**

- Menu → "Current Stock"
- Should show "Basmati Rice" with 120 KG ✓

### 5. **Test Reports**

**Closing Stock:**

- Menu → "Closing Stock"
- Date: (today)
- Click "Generate Closing Stock"
- Verify: Opening=100, In=50, Out=30, Closing=120 ✓
- Click "Export PDF" → Downloads professional PDF
- Click "Export Excel" → Downloads .xlsx file (opens in Excel)

**Historical Closing:**

- Create transactions on different dates
- Select past date in Closing Stock report
- Verify calculation is correct for that date ✓

**Transaction Report:**

- Menu → "Reports" → "Tab 2 - Transaction Report"
- Select date range
- Click "Export PDF" or "Export Excel"
- Verify all transactions included ✓

---

## API Endpoints Reference

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires JWT)

### Products

- `GET /api/products/categories` - List categories
- `POST /api/products/categories` - Create category (ADMIN)
- `GET /api/products/products` - List products
- `POST /api/products/products` - Create product (ADMIN)

### Inventory

- `POST /api/stock-in` - Record stock in
- `POST /api/stock-out` - Record stock out (validates available stock)
- `GET /api/current-stock` - Get current stock (all products)
- `GET /api/current-stock/product/:id` - Get product current stock

### Reports

- `POST /api/closing-stock/calculate` - Calculate closing stock for date
- `GET /api/closing-stock/pdf?closingDate=...` - Download closing stock PDF
- `GET /api/closing-stock/excel?closingDate=...` - Download closing stock Excel
- `GET /api/closing-stock/transactions` - Get transaction ledger
- `GET /api/closing-stock/transactions/pdf` - Download transactions PDF
- `GET /api/closing-stock/transactions/excel` - Download transactions Excel

---

## Troubleshooting

### Backend fails to start: "MongoDB connection error"

→ **Solution:** Ensure MongoDB is running (use one of the options above)

### Frontend shows "Cannot GET" after login

→ **Solution:** Make sure backend is running on port 5000

### API calls return 401 Unauthorized

→ **Solution:** Clear browser storage (localStorage) and login again

### Stock Out shows "Insufficient stock" error

→ **Solution:** This is intentional! Backend prevents negative inventory

### PDF/Excel export returns blank

→ **Solution:** Ensure you've actually created transactions first

---

## Performance Notes

- Inventory calculations use MongoDB aggregation pipeline (server-side)
- Compound indexes on (productId, transactionDate) ensure fast queries
- PDF generation is server-side using pdfkit (no browser plugin needed)
- Excel files are real .xlsx format with proper cell formatting

---

## Architecture

**Backend (Node.js + Express + MongoDB):**

- MVC Pattern with Models, Controllers, Services
- JWT Authentication with Role-Based Access Control
- MongoDB aggregation for fast inventory calculations
- pdfkit for server-side PDF generation
- xlsx for real Excel workbook generation

**Frontend (React + Material-UI):**

- Protected routes (Login required)
- Cascading form dropdowns
- Real-time stock validation
- PDF/Excel download integration
- Responsive design (mobile, tablet, desktop)

**Database (MongoDB):**

- 9 Collections: User, Category, SubCategory, Brand, Unit, Product, InventoryTransaction, OpeningStock, Settings
- Compound indexes for performance
- Immutable transaction ledger (no delete/edit)

---

## Next Steps

1. ✅ Install MongoDB (choose option above)
2. ✅ Start Backend (`npm start` in backend folder)
3. ✅ Start Frontend (`npm start` in frontend folder)
4. ✅ Register and test workflow (see "Test the Application" section)
5. 🎉 You're ready to use Kannan Stores Inventory Management!

---

## Support

For detailed system information, see:

- `README.md` - Full documentation
- `COMPLETION_REPORT.md` - Implementation details
- `.env` files - Configuration
