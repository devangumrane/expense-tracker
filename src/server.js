import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";

import router from "./routes/v1/index.js";
import authRoutes from "./routes/v1/auth.js";

dotenv.config();
const app = express();
console.log("🔍 FRONTEND_URL is:", process.env.FRONTEND_URL);

// ============================================
//  CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ============================================
//  GLOBAL MIDDLEWARE
// ============================================
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// ============================================
//  SESSION + PASSPORT (GLOBAL)
// ============================================
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set to true in production (HTTPS)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// ============================================
//  ROUTES
// ============================================
app.use(`/api/v1`, router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
