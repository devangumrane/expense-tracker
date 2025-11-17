// src/routes/v1/index.js

import express from "express";
import authRoutes from "./auth.routes.js";
import transactionRoutes from "./transaction.routes.js";
import { jwtAuth } from "../../middleware/jwtAuth.js";  // ✔ NEW middleware

const router = express.Router();

// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/transaction", jwtAuth, transactionRoutes);

// Optional: protected test route
router.get("/protected", jwtAuth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

export default router;
