import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logout,
  logoutAll,
} from "../../controllers/auth.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

//
// ─── PASSPORT SERIALIZATION ───────────────────────────────────────────────
//
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

//
// ─── STRATEGIES ───────────────────────────────────────────────
//
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/v1/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/v1/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

//
// ─── ROUTES ───────────────────────────────────────────────
//
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/validate", verifyToken, (req, res) =>
  res.json({ valid: true, userId: req.user.userId })
);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/logout-all", verifyToken, logoutAll);

// ==================== GOOGLE AUTH ====================
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    const payload = {
      id: req.user.id || req.user.emails?.[0]?.value,
      name: req.user.displayName,
      provider: "google",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Redirecting to:", `${process.env.FRONTEND_URL}/dashboard?token=${token}`);

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// ==================== GITHUB AUTH ====================
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    const payload = {
      id: req.user.id || req.user.emails?.[0]?.value,
      name: req.user.displayName,
      provider: "github",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Redirecting to:", `${process.env.FRONTEND_URL}/dashboard?token=${token}`);

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
  }
);

// ==================== SESSION CHECK ====================
router.get("/user", (req, res) => {
  if (req.isAuthenticated()) return res.json(req.user);
  res.status(401).json({ message: "Not authenticated" });
});

export default router;
