📘 Expense Tracker – Backend API

A production-grade Node.js + Express + Prisma + PostgreSQL backend powering a modern Expense Tracking application with:

🔐 Secure JWT Auth (Access + Refresh Tokens)

🌐 Google & GitHub OAuth

📦 Prisma ORM (PostgreSQL)

📁 Clean Modular Architecture

🛡️ Rate Limiting, Helmet, CORS

🧪 Validated Input (Zod)

🧵 Centralized Error Handling

📊 Winston Logging

🍪 HttpOnly Refresh Cookies

This backend is designed for real-world use: scalable, readable, maintainable.

🚀 Features
🔑 Authentication

Local email/password login (hashed using bcrypt)

JWT Access Tokens (15m expiry)

Refresh Tokens (rotating, stored hashed in DB)

Auto token refresh via /auth/refresh

Logout single/all sessions

Protected routes with jwtAuth middleware

🌐 OAuth Providers

Google Login

GitHub Login

OAuth user upsert (existing or create)

Refresh token stored in cookie

Access token redirect to frontend

💰 Transactions

Create, update, delete transactions

Fetch all or a single transaction

Postgres-backed with Prisma

🧱 System Architecture

Clean folder separation

Centralized response formatter

Global error handler

Rate limiter per route group

Strong validation before controllers

📝 Logging

Winston logger

Request-level logging middleware

Error logs stored in /logs

📂 Folder Structure
Expense_Tracker_Backend/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── config/
│   │   └── cookies.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   │
│   ├── middleware/
│   │   ├── jwtAuth.js
│   │   ├── responseFormatter.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── logger.js
│   │
│   ├── models/
│   │   └── index.js
│   │
│   ├── routes/
│   │   └── v1/
│   │       ├── auth.routes.js
│   │       ├── transaction.routes.js
│   │       └── index.js
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   ├── auth.service.js
│   │   │   ├── password.service.js
│   │   │   ├── token.service.js
│   │   │   └── oauth.service.js
│   │   │
│   │   └── transaction/
│   │       └── transaction.service.js
│   │
│   ├── utils/
│   │   └── createLogger.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── transaction.validator.js
│   │   └── validate.js
│   │
│   ├── server.js
│   └── app.js (optional)
│
├── .env.example
├── package.json
├── README.md
└── .gitignore

⚙️ Installation
git clone https://github.com/YOUR_USERNAME/Expense_Tracker_Backend.git
cd Expense_Tracker_Backend
npm install

🔧 Environment Variables

Create a .env file based on .env.example:

PORT=8080
API_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expense_tracker

JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

REFRESH_COOKIE_NAME=refreshToken

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

🗄️ Prisma Setup
1. Generate Prisma Client
npx prisma generate

2. Push schema to DB
npx prisma db push


(Optional) Apply migrations:

npx prisma migrate dev --name init

▶️ Running the Server
Development (nodemon)
npm run dev

Production
npm start


Server runs at:

http://localhost:8080

🔌 API Endpoints
Auth Routes
Method	Endpoint	Description
POST	/api/v1/auth/register	Register user
POST	/api/v1/auth/login	Login user
GET	/api/v1/auth/me	Fetch logged-in user
POST	/api/v1/auth/refresh	Get new access token
POST	/api/v1/auth/logout	Logout current device
POST	/api/v1/auth/logout-all	Logout all sessions
OAuth Routes
Provider	Login URL	Callback
Google	/api/v1/auth/google	/api/v1/auth/google/callback
GitHub	/api/v1/auth/github	/api/v1/auth/github/callback

Frontend receives:

/oauth-success?accessToken=<token>

Transaction Routes
Method	Endpoint	Description
POST	/api/v1/transaction	Create a transaction
GET	/api/v1/transaction	List all transactions
GET	/api/v1/transaction/:id	Get one
PUT	/api/v1/transaction/:id	Update
DELETE	/api/v1/transaction/:id	Delete
🧪 Postman Collection

Import this raw JSON:

Postman Collection URL or raw JSON here


Supports:

Local auth

OAuth

Refresh flow

CRUD transactions

🛡️ Security Highlights

HttpOnly Secure Refresh Token cookie

Short-lived access tokens

Rate limiter on /api & /auth

Helmet for headers

Sanitized inputs

Strong password hashing (bcrypt)

📈 Roadmap

Budget management

Recurring transactions

SMS/email import

AI-powered expense categorization

Insights dashboard (API support)

🤝 Contributing

Fork repo

Create feature branch

Commit cleanly

Open PR

📝 License

MIT License.

🎉 Done

Your README is now GitHub-ready, professional, and matches modern Node backend standards.

If you want, I’ll also generate:

GitHub repo description

Badges (build, license, node version, stars)

.env.example file

GitHub Actions CI script
