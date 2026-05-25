# 🛒 X-Mart SuperShop API

A production-ready **e-commerce REST API** for supermarket/super-shop operations built with **Express.js**, **TypeScript**, and **MongoDB**. Supports multi-branch inventory management, online payments via **SSLCommerz**, role-based authentication, and more.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript (ES2020) |
| **Runtime** | Node.js |
| **Framework** | Express.js 4.19 |
| **Database** | MongoDB (Mongoose ODM 8.5) |
| **Validation** | Zod |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Payment** | SSLCommerz (`sslcommerz-lts`) |
| **Image Mgmt** | Cloudinary |
| **Logging** | Pino + pino-http |
| **Security** | Helmet, Rate-Limit, Mongo-Sanitize |
| **Scheduling** | node-cron |

---

## Features

### 🛍️ Product Management
- Full CRUD with category/price/stock filtering
- Discount engine (percentage/fixed, time-bound)
- Multi-branch inventory tracking
- Image upload via Cloudinary

### 🏪 Multi-Branch System
- Branch CRUD with geospatial (nearby) queries
- Operating hours, facilities, staff management
- Per-branch product availability

### 👥 Auth & Users
- JWT access + refresh token flow
- Role-based access (Admin / User)
- Password hashing with bcryptjs
- Rate limiting on auth endpoints

### 🛒 Orders & Cart
- Cart: add/remove/clear with backend sync
- Orders: COD or Online payment
- Stock deduction on order placement (COD) or payment success (Online)
- Order tracking history with status updates
- Auto stock restore on cancellation

### 💳 SSLCommerz Payment
- Sandbox & live mode toggle via `NODE_ENV`
- Init, Success, Fail, Cancel, IPN webhooks
- Payment status polling endpoint
- Order deletion on failed/cancelled payment

### 📊 Dashboard Ready
- Scheduled cron job (midnight cleanup of expired discounts)
- Structured logging for monitoring
- Standardized API responses

---

## API Routes

Base URL: `/api/v1`

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/auth/change-password` | User/Admin | Change password |
| POST | `/auth/refresh-token` | Cookie | Refresh JWT |

### Users
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/user` | Admin | List all users |
| GET | `/user/:id` | User/Admin | Get user by ID |
| PATCH | `/user/:id` | User/Admin | Update user |
| DELETE | `/user/:id` | Admin | Delete user |
| PATCH | `/user/:id/status` | Admin | Update user status |
| PATCH | `/user/:id/role` | Admin | Update user role |

### Branches
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/branches` | Admin | Create branch |
| GET | `/branches` | — | List all branches |
| GET | `/branches/:id` | — | Get branch by ID |
| PATCH | `/branches/:id` | Admin | Update branch |
| DELETE | `/branches/:id` | Admin | Delete branch |
| GET | `/branches/nearby/locations` | — | Nearby branches (geo) |
| GET | `/branches/:id/products` | — | Branch products |
| GET | `/branches/:id/staff` | Admin | Branch staff |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/products` | Admin | Create product |
| GET | `/products` | — | List products (filtered) |
| GET | `/products/:id` | — | Get product by ID |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| PATCH | `/products/:id/update-stock` | Admin | Update stock |
| POST | `/products/:id/apply-discount` | Admin | Apply discount |
| DELETE | `/products/:id/remove-discount` | Admin | Remove discount |

### Cart
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/cart` | User | Get user cart |
| POST | `/cart` | User | Add/update items |
| DELETE | `/cart` | User | Clear cart |

### Orders
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/orders` | User | Create order |
| GET | `/orders/my-orders` | User | User's orders |
| GET | `/orders/:id` | User/Admin | Get order by ID |
| GET | `/orders` | Admin | All orders |
| PATCH | `/orders/:id/status` | Admin | Update status |
| PATCH | `/orders/:id/cancel` | User | Cancel order |

### Payment
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payment/init` | User | Init SSLCommerz session |
| POST | `/payment/success/:tranId` | — | Success webhook |
| POST | `/payment/fail/:tranId` | — | Failure webhook |
| POST | `/payment/cancel/:tranId` | — | Cancel webhook |
| POST | `/payment/ipn/:tranId` | — | IPN webhook |
| GET | `/payment/status/:orderId` | User | Payment status |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | ✅ | — | `development` or `production` |
| `PORT` | ✅ | — | Server port |
| `MONGO_URI` | ✅ | — | MongoDB connection string |
| `BCRYPT_SALT_ROUND` | ✅ | — | Salt rounds for bcrypt |
| `JWT_SECRET` | ✅ | — | JWT signing secret |
| `JWT_EXPIRES_IN` | ✅ | `7d` | Access token expiry |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token secret |
| `SSL_STORE_ID` | ✅* | — | SSLCommerz store ID |
| `SSL_STORE_PASSWORD` | ✅* | — | SSLCommerz password |
| `BACKEND_URL` | — | `http://localhost:5000` | Backend base URL |
| `CLIENT_URL` | — | `http://localhost:3000` | Client URL |
| `CLOUDINARY_*` | — | — | Cloudinary credentials |
| `CORS_ORIGIN` | — | — | Allowed CORS origin |
| `RATE_LIMIT_MAX` | — | `100` | Rate limit per window |
| `LOG_LEVEL` | — | `info` | Pino log level |

\* Required for payment features.

---

## Project Structure

```
src/
├── config/          # Environment & app configuration
├── constants/       # Enums & constant values
├── controllers/     # Request handlers
├── error/           # Custom error classes & handlers
├── interface/       # TypeScript type definitions
├── middleware/      # Auth, validation, error handling
├── models/          # Mongoose schemas & models
├── repositories/    # Data access layer
├── routes/          # Express route definitions
├── services/        # Business logic layer
├── types/           # Third-party type declarations
├── utils/           # Helpers (logger, pagination, etc.)
├── validations/     # Zod validation schemas
├── app.ts           # Express app setup
└── server.ts        # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
git clone <repo-url>
cd x-mart-backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables)).

### Development

```bash
npm run dev      # Hot-reload via tsx
```

### Build & Production

```bash
npm run build    # Compile to dist/
npm start        # node dist/server.js
```

### Lint

```bash
npm run lint
npm run lint:fix
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development with hot-reload |
| `npm run build` | TypeScript compilation |
| `npm start` | Production start |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |

---

## Architecture

The API follows a **layered architecture**:

```
Routes → Controllers → Services → Repositories → Models
```

- **Routes** — Define HTTP methods & paths, attach middleware
- **Controllers** — Parse request, call service, send response
- **Services** — Business logic & orchestration
- **Repositories** — Data access (Mongoose queries)
- **Models** — Mongoose schemas with indexes & statics

---
