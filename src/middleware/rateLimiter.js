import rateLimit from "express-rate-limit";

// Global limiter — protects all API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200, // allow 200 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Try again later.",
  },
});

// Strict limiter for login/signup
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 10, // only 10 attempts
  message: {
    success: false,
    message: "Too many login attempts. Please wait and try again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
