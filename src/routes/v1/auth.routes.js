import express from "express";
import { register, login } from "../../controllers/auth.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import * as transactionController from "../../controllers/transaction.controller.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/validation",verifyToken, transactionController.create);

export default router;
