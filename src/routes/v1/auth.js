import express from "express";
import { register, login, getCurrentUser } from "../../controllers/auth.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import * as transactionController from "../../controllers/transaction.controller.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/validate", verifyToken, (req, res) => {
  res.json({ valid: true, userId: req.user.userId });
});
router.get("/me", verifyToken, getCurrentUser);

export default router;
