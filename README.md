# StockFlow — Minimal Inventory Management Web Application

> Built with **ASP.NET Core 10 Web API (C#)**, **React.js (Vite)**, **Tailwind CSS**, and **SQL Server** with **Entity Framework Core**.

---

## 🌟 Highlights & Simplicity

- **Zero Bloat:** Minimal, clean, and intuitive enough that anyone can operate it within 2 minutes.
- **4 Focused Sections:**
  1. **Dashboard:** 4 simple KPI cards (Total Products, Available Stock, Total Items Sold, Low Stock Products) + 3 clean summary lists (Best-selling, Recently Sold, Low Stock).
  2. **Products:** Product listing with images, prices, stock, total sold, and automatically generated QR codes with view/print/download options. 3 actions: Add, Edit, Delete.
  3. **Scan Product:** Live camera QR scanner + instant test simulator. Automatically shows product details upon scan with a direct 1-click **Record Sale** form.
  4. **Sales:** 3-step sale recording (Select product, enter quantity, click Sell). Automatically updates stock and increments total sold via atomic SQL transactions, plus full sales history.
- **Rules Enforced:**
  - Never allows negative stock.
  - Automatically flags products with stock `< 5` with clear low-stock badges.
  - Automatic best-selling calculation.
  - Atomic database transactions.

---

## 📁 Project Structure

```
SimpleInventoryApp/
├── backend/                      # ASP.NET Core 10 Web API
│   ├── Controllers/             # ProductsController, SalesController, DashboardController
│   ├── Data/                    # AppDbContext (EF Core SQL Server + Auto-Seeder)
│   ├── DTOs/                    # Clean Data Transfer Objects
│   ├── Models/                  # Product and Sale entities
│   ├── wwwroot/uploads/         # Uploaded product images
│   ├── appsettings.json         # SQL Server connection string
│   ├── Dockerfile               # Ready for Render / Azure container deployment
│   └── Program.cs
├── frontend/                     # React.js (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx    # 4 KPI cards & clean lists
│   │   │   ├── Products.jsx     # Product cards, Add/Edit modal, image upload
│   │   │   ├── ScanProduct.jsx  # Live camera QR scanner & direct sell
│   │   │   ├── Sales.jsx        # Simple sell form & sales history table
│   │   │   ├── Sidebar.jsx      # Minimal 4-item sidebar
│   │   │   └── QrCodeModal.jsx  # Printable/downloadable QR code modal
│   │   ├── api.js               # REST client
│   │   └── App.jsx
│   ├── vercel.json              # Vercel deployment config
│   └── package.json
├── start.bat                     # Double-click to launch both servers
└── start.ps1                     # PowerShell launch script
```

---

## 🚀 Running Locally

### Option 1: Quick Launcher (Recommended)
Double click `start.bat` in this folder, or open PowerShell and run:
```powershell
.\start.ps1
```

### Option 2: Run Manually

#### Backend:
```powershell
cd backend
dotnet run --launch-profile http
```
Backend API will be live at: `http://localhost:5000`

#### Frontend:
```powershell
cd frontend
npm run dev
```
Frontend will be live at: `http://localhost:5173`

---

## 🗄️ Database

- Default Local Connection: `Server=localhost;Database=SimpleInventoryDb;Trusted_Connection=True;TrustServerCertificate=True;`
- Uses Entity Framework Core with automatic database creation and initial sample data seeding on first startup.

---

## ☁️ Deployment Guide

### 1. Deploy Database
- Provision any SQL Server instance (Azure SQL, AWS RDS for SQL Server, or Supabase / Neon if using PostgreSQL).
- Update the connection string via environment variable:
  `ConnectionStrings__DefaultConnection="Server=your-server...;Database=SimpleInventoryDb;User Id=...;Password=...;"`

### 2. Deploy Backend (Render or Azure)
- **Render:**
  - Create a new **Web Service** pointing to the `backend/` folder.
  - Choose **Docker** as runtime (uses the included `backend/Dockerfile`).
  - Add Environment Variable:
    - `ConnectionStrings__DefaultConnection`: Your cloud database connection string.
- **Azure App Service:**
  - Deploy either as a .NET 10 Web App or as a Linux Container using the `backend/Dockerfile`.

### 3. Deploy Frontend (Vercel)
- Import the `frontend/` directory into Vercel.
- Framework preset: **Vite**.
- Add Environment Variable:
  - `VITE_API_URL`: Your live backend URL (e.g., `https://your-inventory-api.onrender.com`).
- Deploy!
