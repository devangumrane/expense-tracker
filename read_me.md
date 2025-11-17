# 📘 Expense Tracker – Backend API

A production-grade **Node.js + Express + Prisma + PostgreSQL** backend powering a modern Expense Tracking application with:

- 🔐 Secure JWT Auth (Access + Refresh Tokens)
- 🌐 Google & GitHub OAuth
- 📦 Prisma ORM (PostgreSQL)
- 🧪 Zod Input Validation
- 🛡️ Rate Limiting, Helmet, CORS
- 🍪 HttpOnly Refresh Cookies
- 📊 Winston Logging
- 📁 Clean Modular Architecture

---

## 🚀 Features

### 🔑 Authentication
- Local login (email/password)
- JWT Access Tokens (15m expiry)
- Refresh Tokens (rotating + stored hashed)
- Token rotation on refresh
- Logout (single & all devices)
- Protected routes with `jwtAuth`

### 🌐 OAuth Providers
- Google OAuth2
- GitHub OAuth2
- Smart upsert (existing user → login, new user → auto register)
- Secure refresh cookie + access token redirect

### 💰 Transactions
- Create, read, update, delete transactions
- Linked to authenticated user
- Prisma-backed, optimized queries

### 📦 Architecture
- Clear routing / controllers / services layer
- Centralized error handler
- Response formatter for consistent API responses
- Environment-configurable cookie policies
- Global rate-limits for `/api` and stricter for `/auth`

### 📝 Logging
- Winston logger
- Request logs
- Error logs saved to `/logs`

---

## 📂 Folder Structure

```
src/
├── config/
│   └── cookies.js
│
├── controllers/
│   ├── auth.controller.js
│   └── transaction.controller.js
│
├── middleware/
│   ├── jwtAuth.js
│   ├── responseFormatter.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── logger.js
│
├── models/
│   └── index.js
│
├── routes/
│   └── v1/
│       ├── auth.routes.js
│       ├── transaction.routes.js
│       └── index.js
│
├── services/
│   ├── auth/
│   │   ├── auth.service.js
│   │   ├── password.service.js
│   │   ├── token.service.js
│   │   └── oauth.service.js
│   │
│   └── transaction/
│       └── transaction.service.js
│
├── utils/
│   └── createLogger.js
│
├── validators/
│   ├── auth.validator.js
│   ├── transaction.validator.js
│   └── validate.js
│
└── server.js
```

---

## ⚙️ Installation

```bash
git clone https://github.com/YOUR_USERNAME/Expense_Tracker_Backend.git
cd Expense_Tracker_Backend
npm install
```

---

## 🔧 Environment Variables

Create `.env`:

```
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
```

---

## 🗄️ Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

(Optional migrations)

```bash
npx prisma migrate dev --name init
```

---

## ▶️ Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Runs at:
```
http://localhost:8080
```

---

## 🔌 API Endpoints

### **Auth Routes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout current device |
| POST | `/api/v1/auth/logout-all` | Logout all sessions |

---

### **OAuth Routes**

| Provider | Login URL | Callback |
|----------|-----------|----------|
| Google | `/api/v1/auth/google` | `/api/v1/auth/google/callback` |
| GitHub | `/api/v1/auth/github` | `/api/v1/auth/github/callback` |

Frontend receives:
```
/oauth-success?accessToken=<token>
```

---

### **Transaction Routes**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/transactions` | Create |
| GET | `/api/v1/transactions` | List |
| GET | `/api/v1/transactions/:id` | Get one |
| PUT | `/api/v1/transactions/:id` | Update |
| DELETE | `/api/v1/transactions/:id` | Delete |

---

## 🧪 Postman Collection

Import the JSON here:

```
Coming soon (postman_collection.json)
```

---

## 🛡️ Security Highlights

- HttpOnly secure refresh cookie
- Short-lived access tokens
- Rate limiting on `/api` & `/auth`
- Helmet enforced
- Sanitized + validated inputs
- Strong bcrypt hashing

---

## 📈 Roadmap

- Budget system  
- Recurring transactions  
- AI-powered categorization  
- Analytics endpoints  

---

## 🤝 Contributing

1. Fork  
2. Branch  
3. Commit  
4. PR  

---

## 📝 License

MIT License

