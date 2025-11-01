import express from "express";
import authRoutes from "./auth.js";
import transactionRoutes from "./transaction.routes.js";  // ✅ Check this line
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/transaction", transactionRoutes);  // ✅ Singular, not plural

router.get("/protected", verifyToken, (req, res) => {
    res.json({ message: "Access granted", user: req.user });
});

export default router;
