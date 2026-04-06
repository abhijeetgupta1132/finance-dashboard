# FinVault — Finance OS

> A full-stack financial management dashboard with role-based access control, transaction tracking, analytics, and user administration.

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repo](#1-clone-the-repo)
  - [2. Backend setup](#2-backend-setup)
  - [3. Frontend setup](#3-frontend-setup)
- [Demo Accounts](#demo-accounts)
- [Features](#features)
- [Pages & Components](#pages--components)
- [Role Permissions](#role-permissions)
- [Income & Expense Categories](#income--expense-categories)
- [API Reference](#api-reference)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
  - [Push to GitHub](#push-to-github)
  - [Backend → Render](#backend--render)
  - [Frontend → Vercel](#frontend--vercel)
  - [Required Code Changes for Production](#required-code-changes-for-production)
- [.gitignore](#gitignore)
- [Common Issues & Fixes](#common-issues--fixes)
- [License](#license)

---

## Overview

FinVault is a role-gated financial dashboard built for teams that need to track income and expenses, visualize monthly trends, and manage user access — all in one place.

- The **backend** is a Node.js/Express REST API using SQLite via `better-sqlite3`
- The **frontend** is a React (CRA) SPA with Recharts for data visualization
- Authentication is JWT-based with tokens stored in `localStorage`
- The database auto-creates and seeds demo data on first run — no manual setup required

---

## Screenshots

> _Add screenshots here after deployment._

| Login | Dashboard | Records | Analytics |
|-------|-----------|---------|-----------|
| ![Login](./screenshots/login.png) | ![Dashboard](./screenshots/dashboard.png) | ![Records](./screenshots/records.png) | ![Analytics](./screenshots/analytics.png) |

---

## Tech Stack

### Frontend
| Library | Purpose |
|---------|---------|
| React 18 (CRA) | UI framework |
| React Router v6 | Client-side routing with nested routes |
| Axios | HTTP client with request/response interceptors |
| Recharts | Bar, Line, and Pie/Donut charts |
| React Hot Toast | Toast notifications |
| Cabinet Grotesk | Display font (Google Fonts) |
| Instrument Serif | Serif/italic accent font (Google Fonts) |
| JetBrains Mono | Monospace font for amounts and dates |

### Backend
| Library | Purpose |
|---------|---------|
| Express | HTTP server and routing |
| better-sqlite3 | Synchronous SQLite driver |
| jsonwebtoken | JWT creation and verification |
| bcryptjs | Password hashing (salt rounds: 10) |
| helmet | Secure HTTP headers |
| cors | Cross-origin resource sharing |
| morgan | HTTP request logger (`dev` mode) |
| express-rate-limit | 200 requests per 15 min per IP on `/api/*` |
| dotenv | Environment variable loading |

---

## Project Structure

```
finance-dashboard/
│
├── backend/
│   ├── data/                    # SQLite database (auto-created — do NOT commit)
│   │   └── finance.db
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js      # DB connection, schema init, seed data
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verification middleware
│   │   └── routes/
│   │       ├── auth.js          # /api/auth/*
│   │       ├── users.js         # /api/users/*
│   │       ├── records.js       # /api/records/*
│   │       └── dashboard.js     # /api/dashboard/*
│   ├── server.js                # Express app entry point
│   ├── .env                     # Local env vars (do NOT commit)
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx       # Sidebar + <Outlet /> wrapper
    │   │   ├── Sidebar.jsx      # Navigation, user info, logout button
    │   │   └── UI.jsx           # All shared UI components
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state, login(), logout(), useAuth()
    │   ├── pages/
    │   │   ├── Login.jsx        # Login form + quick demo access
    │   │   ├── Dashboard.jsx    # Summary stats + recent records
    │   │   ├── Records.jsx      # Transaction table + CRUD modals
    │   │   ├── Analytics.jsx    # Charts and category analytics
    │   │   └── Users.jsx        # User management (admin only)
    │   ├── utils/
    │   │   ├── api.js           # Axios instance with auth interceptors
    │   │   └── format.js        # formatCurrency, formatDate, CATEGORIES, COLORS
    │   ├── App.jsx              # Router, auth guards, all route definitions
    │   ├── index.js             # React DOM entry point
    │   └── index.css            # CSS variables, fonts, animations, global reset
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

Verify:
```bash
node -v
npm -v
```

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/finance-dashboard.git
cd finance-dashboard
```

---

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

> Generate a strong `JWT_SECRET`:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

Start the server:

```bash
node server.js
```

Expected output:
```
 Backend: http://localhost:5000
admin@finance.com     / admin123
analyst@finance.com   / analyst123
viewer@finance.com    / viewer123
```

The SQLite database (`backend/data/finance.db`) is **automatically created and seeded** with 3 users and 6 months of sample records on first run. No manual database setup needed.

---

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`. API requests to `/api` are proxied to `http://localhost:5000` automatically via Axios `baseURL: "/api"`.

---

## Demo Accounts

Seeded automatically on first backend run:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@finance.com | admin123 | Dashboard, Records, Analytics, Users |
| **Analyst** | analyst@finance.com | analyst123 | Dashboard, Records, Analytics |
| **Viewer** | viewer@finance.com | viewer123 | Dashboard, Records (read-only) |

The Login page has a **Quick Demo Access** panel — click any role button to auto-fill credentials.

---

## Features

### Authentication
- JWT login — token stored in `localStorage`
- Token auto-attached to all requests via Axios request interceptor
- Auto-redirect to `/login` on any 401 response (interceptor in `api.js`)
- Auth state re-hydrated on page refresh via `GET /api/auth/me`
- Route guards in `App.jsx`: `RequireAuth`, `RequireRole`, `GuestOnly`

### Dashboard
- Summary stat cards: Total Income, Total Expenses, Net Balance, Record Count
- Recent transactions list
- Staggered entrance animations on load

### Financial Records
- Full CRUD: create, edit, soft-delete income/expense records
- Fields: amount, type, category, date, notes, created\_by
- Server-side pagination — 15 records per page
- Filters: type dropdown, category text search, start date, end date
- One-click "Clear filters" button
- Role-gated: Viewers can read but cannot create/edit/delete

### Analytics _(Admin & Analyst only)_
- **Stat cards:** Avg Monthly Income, Avg Monthly Expense, Savings Rate %, Expense Category Count
- **Monthly Bar Chart:** Side-by-side income vs expenses (6 months, Recharts BarChart)
- **Net Balance Line Chart:** Monthly net trend (Recharts LineChart)
- **Expense Category Bars:** Progress bars with % share per category
- **Income Donut Chart:** Breakdown by income source (Recharts PieChart)

### User Management _(Admin only)_
- Role count cards: Admins, Analysts, Viewers
- Full user table with name, email, role, status, join date
- Create new users (name, email, password, role)
- Change any other user's role via inline dropdown
- Activate / Deactivate users
- Delete users
- Own account is protected — cannot be changed from this page

### UI & UX
- Warm ivory light theme with CSS custom properties (`index.css`)
- Dark sidebar with indigo accent glow
- Smooth entrance animations: `fadeIn`, `slideUp`, `stagger` classes
- Hover lift effects on stat cards
- Backdrop-blur modals with `slideUp` animation
- Toast notifications for all success/error states
- `PageLoader` and `Empty` components for loading/empty states
- Custom scrollbar (4px, rounded)

---

## Pages & Components

### Shared UI Components (`src/components/UI.jsx`)

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `Card` | `children`, `style` | White surface card with border and shadow |
| `Badge` | `type`, `children` | Color-coded pill. Types: `income`, `expense`, `admin`, `analyst`, `viewer`, `active`, `inactive` |
| `Spinner` | `size` | Rotating CSS border spinner |
| `PageLoader` | — | Full-height centered loading state with spinner |
| `Empty` | `icon`, `title`, `message`, `action` | Empty state display with optional CTA button |
| `Modal` | `open`, `onClose`, `title`, `width`, `children` | Fixed backdrop modal with blur and slide-up animation |
| `StatCard` | `label`, `value`, `sub`, `icon`, `color`, `delay` | Animated metric card with color accent bar and icon |
| `Button` | `variant`, `size`, `onClick`, `disabled`, `type`, `style` | Variants: `primary` `secondary` `danger` `success` `ghost`. Sizes: `sm` `md` `lg` |
| `Input` | `label`, `error`, `...props` | Labeled text input with focus highlight and error state |
| `Select` | `label`, `error`, `children`, `...props` | Labeled select dropdown |

### Layout & Navigation

**`Layout.jsx`** — wraps all authenticated pages. Renders `<Sidebar />` on the left and `<Outlet />` (the current page) on the right with `marginLeft: var(--nav-width)`.

**`Sidebar.jsx`** — 252px fixed dark sidebar:
- FinVault logo and "Finance OS" tag
- Nav links filtered by the current user's role
- Active link: purple background + glowing dot indicator
- Bottom section: avatar (first letter), role badge, Sign Out button
- Logout clears the JWT token and resets auth state via `AuthContext`

### AuthContext (`src/context/AuthContext.jsx`)

Provides `{ user, loading, login, logout }` via the `useAuth()` hook.

| Method | Description |
|--------|-------------|
| `login(email, password)` | POST to `/api/auth/login`, saves token, sets user state |
| `logout()` | Removes token from localStorage, nulls user, shows success toast |

---

## Role Permissions

| Action | Admin | Analyst | Viewer |
|--------|:-----:|:-------:|:------:|
| View Dashboard | ✅ | ✅ | ✅ |
| View Records | ✅ | ✅ | ✅ |
| Create Record | ✅ | ✅ | ❌ |
| Edit Record | ✅ | ✅ | ❌ |
| Delete Record | ✅ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ❌ |
| View Users page | ✅ | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ |
| Change User Role | ✅ | ❌ | ❌ |
| Activate/Deactivate User | ✅ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ |

---

## Income & Expense Categories

Defined in `src/utils/format.js` — used in record form dropdowns and analytics grouping.

**Income categories:**
`Salary`, `Freelance`, `Investment`, `Rental`, `Bonus`

**Expense categories:**
`Rent`, `Food`, `Transport`, `Utilities`, `Healthcare`, `Entertainment`, `Education`

---

## API Reference

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Rate limit: **200 requests / 15 minutes** per IP across all `/api/*` routes.

---

### Auth Routes

#### `POST /api/auth/login`
No auth required.

**Request:**
```json
{ "email": "admin@finance.com", "password": "admin123" }
```

**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@finance.com",
    "role": "admin",
    "status": "active"
  }
}
```

**Response 401:**
```json
{ "error": "Invalid credentials" }
```

---

#### `GET /api/auth/me`
Requires valid JWT.

**Response 200:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@finance.com",
    "role": "admin",
    "status": "active"
  }
}
```

---

#### `POST /api/auth/register`
Requires **Admin** role.

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "securepassword",
  "role": "analyst"
}
```

**Response 201:**
```json
{
  "message": "User created",
  "user": { "id": 4, "name": "Jane Doe", "email": "jane@company.com", "role": "analyst" }
}
```

---

### Record Routes

#### `GET /api/records`
Requires token. Supports filters and pagination.

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `15` | Records per page |
| `type` | string | — | `income` or `expense` |
| `category` | string | — | Partial text match |
| `startDate` | string | — | `YYYY-MM-DD` |
| `endDate` | string | — | `YYYY-MM-DD` |

**Response 200:**
```json
{
  "records": [
    {
      "id": 1,
      "amount": 5000.00,
      "type": "income",
      "category": "Salary",
      "date": "2025-03-01",
      "notes": "March salary",
      "created_by": 1,
      "created_by_name": "Admin User",
      "created_at": "2025-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 15,
    "total": 87,
    "totalPages": 6
  }
}
```

---

#### `POST /api/records`
Requires **Admin** or **Analyst** role.

**Request:**
```json
{
  "amount": 1200.00,
  "type": "expense",
  "category": "Rent",
  "date": "2025-04-01",
  "notes": "April rent"
}
```

**Response 201:**
```json
{ "message": "Record created", "id": 92 }
```

---

#### `PUT /api/records/:id`
Requires **Admin** or **Analyst** role. Send only the fields you want to update.

**Response 200:**
```json
{ "message": "Record updated" }
```

---

#### `DELETE /api/records/:id`
Requires **Admin** or **Analyst** role. Sets `is_deleted = 1` (soft delete).

**Response 200:**
```json
{ "message": "Record deleted" }
```

---

### Dashboard Routes

#### `GET /api/dashboard/trends`
Requires token. Returns last 6 months of monthly aggregates.

**Response 200:**
```json
{
  "monthly_trends": [
    { "period": "2024-11", "income": 18000.00, "expenses": 9500.00 },
    { "period": "2024-12", "income": 21000.00, "expenses": 11200.00 }
  ]
}
```

---

#### `GET /api/dashboard/category-analytics`
Requires token. Returns totals grouped by category.

**Response 200:**
```json
{
  "expense_by_category": [
    { "category": "Rent", "total": 24000.00, "count": 6 }
  ],
  "income_by_category": [
    { "category": "Salary", "total": 90000.00, "count": 6 }
  ]
}
```

---

### User Routes _(Admin only)_

#### `GET /api/users`
**Response 200:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@finance.com",
      "role": "admin",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

#### `PATCH /api/users/:id/role`
**Request:** `{ "role": "analyst" }`
**Response 200:** `{ "message": "Role updated" }`

---

#### `PATCH /api/users/:id/status`
**Request:** `{ "status": "inactive" }`
**Response 200:** `{ "message": "Status updated" }`

---

#### `DELETE /api/users/:id`
**Response 200:** `{ "message": "User deleted" }`

---

### Health Check

#### `GET /health`
No auth required. Used for uptime monitoring.

**Response 200:** `{ "status": "ok" }`

---

## Database

SQLite via `better-sqlite3`. File stored at `backend/data/finance.db`, auto-created on first run. WAL mode and foreign keys are enabled.

### Schema

#### `users` table

| Column | Type | Constraints |
|--------|------|------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `name` | TEXT | NOT NULL |
| `email` | TEXT | UNIQUE NOT NULL |
| `password` | TEXT | bcrypt hashed, NOT NULL |
| `role` | TEXT | CHECK IN (`admin`, `analyst`, `viewer`) |
| `status` | TEXT | CHECK IN (`active`, `inactive`), DEFAULT `active` |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

#### `financial_records` table

| Column | Type | Constraints |
|--------|------|------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `amount` | REAL | CHECK > 0, NOT NULL |
| `type` | TEXT | CHECK IN (`income`, `expense`) |
| `category` | TEXT | NOT NULL |
| `date` | TEXT | `YYYY-MM-DD`, NOT NULL |
| `notes` | TEXT | Optional |
| `created_by` | INTEGER | FK → users.id |
| `is_deleted` | INTEGER | Soft delete flag, DEFAULT 0 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

Indexes on: `date`, `type`, `is_deleted`

### Seed Data

On first run, `database.js` seeds:
- **3 users**: admin, analyst, viewer with bcrypt-hashed passwords
- **~138 records** across the last 6 months: 8 income + 15 expense entries per month, all attributed to the admin user, with random amounts and categories

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `PORT` | No | `5000` | Express server port |
| `JWT_SECRET` | **Yes** | — | Secret for signing/verifying JWTs |
| `NODE_ENV` | No | `development` | Set to `production` on Render |
| `FRONTEND_URL` | Prod only | — | Your Vercel URL — used for CORS |

### Frontend (Vercel environment variables)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `REACT_APP_API_URL` | Prod only | Full URL of your Render backend |

No `.env` file needed locally — Axios uses `baseURL: "/api"` which resolves relative to `localhost:3000` (proxied to port 5000).

---

## Deployment

### Push to GitHub

Run from `finance-dashboard/` root:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/finance-dashboard.git
git branch -M main
git push -u origin main
```

---

### Backend → Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect GitHub → select `finance-dashboard`
3. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |

4. Add Environment Variables:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | your generated secret |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | _(add after deploying frontend)_ |

5. Click **Create Web Service**

Backend will be live at: `https://your-service.onrender.com`

> ⚠️ **Render free tier = ephemeral disk.** The SQLite `.db` file is wiped on every restart/redeploy, resetting all data to seed values. For persistent storage, migrate to a hosted Postgres database (Render Postgres, Neon, Supabase, etc.).

---

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your repo
2. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Framework Preset | Create React App |
| Build Command | `npm run build` |
| Output Directory | `build` |

3. Add Environment Variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-service.onrender.com` |

4. Click **Deploy**

Frontend will be live at: `https://your-app.vercel.app`

5. **Go back to Render** → your service → Environment → add:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - Save → Render auto-redeploys

---

### Required Code Changes for Production

Make both changes before pushing. Without them, you will get CORS errors and broken API calls in production.

#### 1. `backend/server.js` — update CORS

```js
// BEFORE
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// AFTER
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
```

#### 2. `frontend/src/utils/api.js` — update baseURL

```js
// BEFORE
const api = axios.create({ baseURL: "/api", timeout: 10000 });

// AFTER
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "/api",
  timeout: 10000,
});
```

---

## .gitignore

Place this file in `finance-dashboard/` (project root):

```gitignore
# Dependencies
node_modules/
frontend/node_modules/
backend/node_modules/

# Environment variables — NEVER commit
.env
backend/.env

# SQLite database — auto-created, do not commit
backend/data/

# React build output
frontend/build/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## Common Issues & Fixes

**API calls fail after deploying to Vercel**
Axios still uses `baseURL: "/api"` which resolves to the Vercel domain. Fix: add `REACT_APP_API_URL` in Vercel environment variables, then redeploy.

**CORS error in browser console**
`server.js` still has `origin: "http://localhost:3000"` hardcoded. Fix: apply the CORS change above and set `FRONTEND_URL` in Render's environment variables.

**Backend crashes on Render**
Most likely `JWT_SECRET` is missing. Check Render → Environment tab. Also ensure `better-sqlite3` compiled correctly — if not, set the build command to `npm install && npm rebuild better-sqlite3`.

**All data is lost after Render redeploy**
Expected behavior on the free tier — ephemeral disk wipes the SQLite file. The seed data will be restored automatically. For real persistence, switch to a hosted database.

**Login returns 401 with correct credentials**
The database was wiped and re-seeded. Use the original demo credentials. If you've changed them, check Render's logs or the terminal output for the seeded passwords.

**Render service takes 20–30 seconds to respond**
The free tier spins down after 15 minutes of inactivity. Fix: upgrade to a paid plan, or set up a cron job to ping `GET /health` every 10 minutes to keep it warm.

**`npm start` fails in frontend**
Run `npm install` first. If you see dependency conflicts, try `npm install --legacy-peer-deps`.

---

## License

MIT — free to use, modify, and distribute.
