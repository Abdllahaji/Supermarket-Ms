# 🛒 Supermarket Management System (Offline POS & Inventory)

A complete, modern, offline/local-network **Supermarket Management System** designed for high-speed checkout, real-time inventory management, customer loyalty, discounts, multi-role access control, and actionable analytics.

---

## 🚀 Key Features

### 1. 🛡️ Role-Based Access Control (RBAC)
- **Admin**: Full control over products, users, cashiers, customers, pricing, discounts, locations, invoices, and analytics.
- **Manager**: Manage products, pricing history, inventory stock alerts, discounts, and view analytics reports.
- **Cashier**: High-speed POS interface, customer lookup, barcode scanning, discount application, receipts & sales history.

### 2. ⚡ Cashier Point of Sale (POS) Interface
- Real-time **barcode scanning** and instant product search.
- Interactive cart management with quantity increment/decrement.
- Automatic discount detection and auto-calculation.
- Split-second subtotal, tax (5%), discount deduction, and net total calculation.
- Quick cash denomination buttons (`Exact`, `+$5`, `+$10`, `+$20`, `+$50`, `+$100`) and live change calculation.
- Card and cash checkout with thermal printer/receipt modal layout.

### 3. 📦 Product & Inventory Management
- Full catalog with category filtering, barcode uniqueness, stock quantities, and minimum stock threshold indicators.
- Automatic **Low Stock Warning Alerts** across dashboard and inventory reports.
- Product aisle, shelf, and branch physical location assignment.

### 4. 🏷️ Dynamic Pricing & Price History Tracking
- Track every price adjustment with timestamp, reason, and changing user.
- Audit trail for financial compliance.

### 5. 🎁 Discount & Promotion Management
- Percentage (%) or Fixed ($) discounts.
- Date-range validity scheduling (automatic start/expiration).
- Category-level or product-specific discount mapping.
- Minimum purchase amount trigger.

### 6. 👥 Customer & Loyalty Program
- Customer database with contact details, address, and purchase logs.
- Automatic **Loyalty Points** accrual (1 point per \$10 spent).
- POS customer linkage during checkout.

### 7. 🏢 Supermarket Location & Shelf Management
- Multi-branch, section, aisle, and shelf mapping for physical product tracking.

### 8. 📊 Executive Dashboard & Reporting
- Summary KPI Cards: Today's Revenue, Monthly Revenue, Total Sales, Low Stock Alerts, Active Discounts.
- Interactive **Recharts** charts: 6-Month Monthly Revenue Trends, Daily Sales Trends, Payment Method Distribution.
- Tabbed Reports:
  - **Sales Report**: Filterable date ranges, average ticket, cash vs. card breakdown.
  - **Product Report**: Inventory valuation, total units sold, turnover by SKU.
  - **Customer Report**: Top spenders, loyalty rankings, frequency of visit.
  - **Revenue Report**: Daily revenue trajectories and best revenue day indicator.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Recharts, React Icons, React Hot Toast, Axios
- **Backend**: Node.js, Express.js, Mongoose, JWT (JSON Web Tokens), Bcrypt.js, Morgan
- **Database**: MongoDB (Local/Offline instance)

---

## 📦 Project Structure

```
SUPERMARKET MS/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection logic
│   ├── controllers/
│   │   ├── authController.js     # Login, authentication & user profile
│   │   ├── userController.js     # User & cashier CRUD
│   │   ├── productController.js  # Product catalogue & stock tracking
│   │   ├── customerController.js # Customer profiles & loyalty points
│   │   ├── saleController.js     # Invoice creation & sales ledger
│   │   ├── discountController.js # Promotion rules & active discounts
│   │   ├── locationController.js # Branches, aisles & shelf mapping
│   │   ├── priceController.js    # Price audit logs
│   │   ├── dashboardController.js# Summary stats & graph aggregates
│   │   └── reportController.js   # Sales, inventory, customer & revenue reports
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Customer.js
│   │   ├── Sale.js
│   │   ├── Discount.js
│   │   ├── Location.js
│   │   └── PriceHistory.js
│   ├── routes/                   # Express route definitions
│   ├── utils/
│   │   ├── seedAdmin.js          # Default admin initializer
│   │   └── seedData.js           # Full sample supermarket database seeder
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Server entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Centralized Axios with Bearer token interceptor
    │   ├── components/
    │   │   ├── common/           # Reusable DataTable, Modal, SearchBar, Pagination, StatCard, etc.
    │   │   └── Layout/           # Sidebar, Header, MainLayout with responsive drawer
    │   ├── context/
    │   │   └── AuthContext.js    # Global authentication & user state
    │   ├── pages/
    │   │   ├── Login.jsx         # Sign in screen
    │   │   ├── Dashboard.jsx     # Executive overview & charts
    │   │   ├── POS.jsx           # Cashier Point of Sale terminal
    │   │   ├── Products.jsx      # Product management & stock
    │   │   ├── Customers.jsx     # Customer loyalty & directory
    │   │   ├── Cashiers.jsx      # Cashier account administration
    │   │   ├── Sales.jsx         # Sales history & printable receipts
    │   │   ├── Discounts.jsx     # Promotions & coupon engine
    │   │   ├── Locations.jsx     # Store branch & aisle configuration
    │   │   ├── Users.jsx         # System user management (Admin only)
    │   │   └── Reports.jsx       # Tabbed analytics reports
    │   ├── App.js
    │   ├── index.css
    │   └── index.js
    ├── package.json
    └── tailwind.config.js
```

---

## 🔑 Default Credentials

When the database is initialized or seeded, the following accounts are ready to use:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@supermarket.com` | `admin123` | Full administrative access to all modules |
| **Manager** | `manager@supermarket.com` | `admin123` | Inventory, Pricing, Discounts, Reports |
| **Cashier** | `sarah@supermarket.com` | `cashier123` | POS Terminal, Product Lookup, Customer Search |

---

## 🚀 Quick Start Guide

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port `27017` (e.g. via MongoDB Community Server or MongoDB Compass).

### Step 2: Set Up Backend
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional but Recommended)* Seed the database with comprehensive sample supermarket products, locations, discounts, and sales history:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Backend runs on `http://localhost:5000`*

---

### Step 3: Set Up Frontend
1. Open a second terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React application:
   ```bash
   npm start
   ```
   *Frontend opens at `http://localhost:3000`*

---

## 📡 REST API Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/dashboard/stats` | Authenticated | KPI counts, revenue metrics & monthly charts |
| `GET` | `/api/products` | Authenticated | Paginated products list with search & category filter |
| `GET` | `/api/products/barcode/:barcode` | Authenticated | POS instant barcode lookup |
| `GET` | `/api/products/low-stock` | Authenticated | Items at or below minimum threshold |
| `POST` | `/api/products` | Admin/Manager | Create new product |
| `PUT` | `/api/products/:id` | Admin/Manager | Update product (logs price change history) |
| `GET` | `/api/customers` | Authenticated | Customer list with loyalty points & search |
| `POST` | `/api/customers` | Authenticated | Register new customer |
| `GET` | `/api/sales` | Authenticated | Searchable sales & invoice registry |
| `POST` | `/api/sales` | Authenticated | Checkout sale, deduct stock & award loyalty points |
| `GET` | `/api/sales/daily` | Authenticated | Today's aggregate transaction summary |
| `GET` | `/api/discounts/active` | Authenticated | Currently valid promotions for POS |
| `GET` | `/api/locations` | Authenticated | Store branches, sections, and aisles |
| `GET` | `/api/reports/sales` | Admin/Manager | Sales performance report with date filter |
| `GET` | `/api/reports/products` | Admin/Manager | Inventory stock & SKU valuation report |
| `GET` | `/api/reports/customers` | Admin/Manager | Customer spending and loyalty ranking |
| `GET` | `/api/reports/revenue` | Admin/Manager | Daily revenue trend and peak sales day |
