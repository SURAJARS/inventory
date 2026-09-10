# Kannan Stores - Warehouse Inventory Management System

A complete warehouse inventory management application for Kannan Stores. Track stock in, stock out, calculate closing stock, and generate reports.

## Features

- **User Authentication**: Login/Register with role-based access (ADMIN, STAFF)
- **Stock In**: Record goods received into the warehouse
- **Stock Out**: Record goods leaving the warehouse with insufficient stock validation
- **Current Stock**: View real-time inventory for all products
- **Inventory Transactions**: Complete transaction history with filters
- **Closing Stock**: Calculate closing stock for any selected date
- **Reports**: Generate closing stock and transaction reports in PDF and Excel formats
- **Product Master**: Manage products, categories, sub-categories, brands, and units (ADMIN only)
- **Dashboard**: Quick overview of inventory status

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **PDF Generation**: pdfkit
- **Excel Generation**: xlsx

### Frontend

- **UI Framework**: React 18.2
- **Component Library**: Material-UI (MUI) 5
- **HTTP Client**: Axios
- **Date Library**: dayjs
- **Router**: React Router v6

## Project Structure

```
inventory/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Category.js
│   │   │   ├── SubCategory.js
│   │   │   ├── Brand.js
│   │   │   ├── Unit.js
│   │   │   ├── Product.js
│   │   │   ├── InventoryTransaction.js
│   │   │   ├── OpeningStock.js
│   │   │   └── Settings.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   ├── .env
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or remote)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kannan-inventory
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=7d
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend

```bash
cd backend
npm start
```

Backend runs on: `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Product Master

- `GET /api/products/categories` - List categories
- `POST /api/products/categories` - Create category
- `PUT /api/products/categories/:id` - Update category
- `GET /api/products/subcategories` - List sub-categories
- `POST /api/products/subcategories` - Create sub-category
- `GET /api/products/brands` - List brands
- `POST /api/products/brands` - Create brand
- `GET /api/products/units` - List units
- `POST /api/products/units` - Create unit
- `GET /api/products/products` - List products
- `POST /api/products/products` - Create product
- `PUT /api/products/products/:id` - Update product

### Stock Management

- `POST /api/stock-in` - Record stock in
- `GET /api/stock-in/history` - Get stock in history
- `POST /api/stock-out` - Record stock out
- `GET /api/stock-out/history` - Get stock out history

### Inventory View

- `GET /api/current-stock` - Get current stock for all products
- `GET /api/current-stock/product/:id` - Get stock for specific product
- `GET /api/current-stock/search` - Search products

### Reports

- `POST /api/closing-stock/calculate` - Calculate closing stock
- `GET /api/closing-stock/pdf` - Download closing stock PDF
- `GET /api/closing-stock/excel` - Download closing stock Excel
- `GET /api/closing-stock/transactions` - Get transactions
- `GET /api/closing-stock/transactions/pdf` - Download transactions PDF
- `GET /api/closing-stock/transactions/excel` - Download transactions Excel

### Opening Stock (ADMIN only)

- `POST /api/opening-stock` - Set opening stock
- `GET /api/opening-stock/all` - Get all opening stocks
- `GET /api/opening-stock/:productId` - Get opening stock for product

## Core Inventory Calculation

The system uses a transaction-based approach:

```
Current Stock = Opening Stock + Stock In - Stock Out

Closing Stock (date) = Opening Stock +
                       Sum(Stock In ≤ date) -
                       Sum(Stock Out ≤ date)
```

All calculations are performed on the backend using MongoDB aggregation pipelines.

## Key Features

### Negative Stock Protection

- Stock Out transactions are rejected if quantity exceeds available stock
- Validation happens on both frontend and backend
- Prevents inventory inconsistencies

### Historical Closing Stock

- Generate closing stock for any previous date
- All transactions up to end of day are included
- Maintains audit trail of historical inventory

### Role-Based Access

- **ADMIN**: Full access including product master, opening stock setup, settings
- **STAFF**: Stock In/Out, view inventory, view transactions

### Reports

- Professional PDF generation with proper formatting
- Real XLSX Excel workbook generation
- Multiple export options from closing stock and transaction pages

## Database Models

### User

- Authentication and authorization
- Tracks who performed each transaction

### Product

- Combination of Category, SubCategory, Brand, Unit
- Minimum stock level for warnings

### InventoryTransaction

- Every stock movement is recorded
- Immutable transaction log
- References to all related entities for audit trail

### OpeningStock

- Initial inventory position
- Effective date for historical calculations
- ADMIN-only modification

## Error Handling

- Comprehensive validation on frontend and backend
- User-friendly error messages
- Proper HTTP status codes
- Validation of insufficient stock before transaction creation

## Building for Production

### Backend Build

```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Frontend Build

```bash
cd frontend
npm run build
```

Optimized build output in `frontend/build/`

## Testing Scenario

**Setup:**

1. Create test product: "Rice" with unit "KG"
2. Set opening stock: 100 KG
3. Record Stock In: 50 KG
4. Record Stock Out: 30 KG

**Expected Results:**

- Current Stock: 120 KG
- Closing Stock (same date): 120 KG
- PDF/Excel reports show: Opening 100, In 50, Out 30, Closing 120

**Historical Test:**

- Day 1: Opening 100 + In 50 - Out 20 = 130
- Day 2: In 40 - Out 30 = 140
- Generate report for Day 1 → 130 ✓
- Generate report for Day 2 → 140 ✓

## Known Limitations

- "No. of Units" field is stored but not used in calculations (by design)
- Unit conversion not implemented (can be future enhancement)
- Bulk import/export not implemented
- API rate limiting not configured

## Future Enhancements

- Unit conversion system
- Bulk inventory import
- Advanced filtering and reporting
- Barcode scanning
- Multi-warehouse support
- Low stock alerts and notifications
- Inventory reconciliation tools
- User activity audit logs

## Support

For issues or questions, contact the development team.

## License

PROPRIETARY - Kannan Stores
