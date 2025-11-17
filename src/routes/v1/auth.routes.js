// src/routes/v1/auth.routes.js
import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import cookieParser from "cookie-parser";

import { validate } from "../../validators/validate.js";
import { signupSchema, loginSchema } from "../../validators/auth.validator.js";
import { authLimiter } from "../../middleware/rateLimiter.js";
import { jwtAuth } from "../../middleware/jwtAuth.js";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
  logoutAll,
  getMe,
} from "../../controllers/auth.controller.js";

import { upsertOAuthUser } from "../../services/auth/oauth.service.js";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_OPTIONS,
} from "../../config/cookies.js";

const router = express.Router();
router.use(cookieParser()); // needed to read refresh cookie in routes

// ----------------------
// Local auth
// ----------------------
router.post("/register", authLimiter, validate(signupSchema), registerUser);
router.post("/login", authLimiter, validate(loginSchema), loginUser);

// ----------------------
// Protected / token routes
// ----------------------
router.get("/me", jwtAuth, getMe);
router.post("/refresh", refreshAccessToken); // reads cookie or body
router.post("/logout", logout); // clear cookie + revoke token
router.post("/logout-all", jwtAuth, logoutAll);

// ----------------------
// Passport OAuth config (stateless)
// ----------------------
const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 8080}`;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Initialize passport strategies (no sessions)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${API_URL}/api/v1/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${API_URL}/api/v1/auth/github/callback`,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// Ensure passport initialized in server.js: app.use(passport.initialize())

// ----------------------
// OAuth: Google
// ----------------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  async (req, res) => {
    try {
      // req.user is provider profile
      const { user, accessToken, refreshToken } = await upsertOAuthUser(
        "google",
        req.user
      );

      // Set secure httpOnly refresh cookie
      res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

      // Redirect to frontend with short-lived access token in query
      return res.redirect(
        `${FRONTEND_URL}/oauth-success?accessToken=${encodeURIComponent(
          accessToken
        )}`
      );
    } catch (err) {
      console.error("Google OAuth error:", err);
      return res.redirect(`${FRONTEND_URL}/oauth-error`);
    }
  }
);

// ----------------------
// OAuth: GitHub
// ----------------------
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/", session: false }),
  async (req, res) => {
    try {
      const { user, accessToken, refreshToken } = await upsertOAuthUser(
        "github",
        req.user
      );

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

      return res.redirect(
        `${FRONTEND_URL}/oauth-success?accessToken=${encodeURIComponent(
          accessToken
        )}`
      );
    } catch (err) {
      console.error("GitHub OAuth error:", err);
      return res.redirect(`${FRONTEND_URL}/oauth-error`);
    }
  }
);

export default router;
