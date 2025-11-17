// src/routes/v1/transaction.routes.js
import express from "express";
import * as transactionController from "../../controllers/transaction.controller.js";
import { jwtAuth } from "../../middleware/jwtAuth.js";
import { validate } from "../../validators/validate.js";
import { createTransactionSchema } from "../../validators/transaction.validator.js";

const router = express.Router();

// All transaction routes require authentication
router.use(jwtAuth);

// Create transaction
router.post("/", validate(createTransactionSchema), transactionController.create);

// Get all transactions for user
router.get("/", transactionController.getAll);

// Get summary analytics
router.get("/summary", transactionController.getSummary);

// Get one transaction
router.get("/:id", transactionController.getOne);

// Update transaction
router.put("/:id", validate(createTransactionSchema), transactionController.update);

// Delete transaction (soft delete recommended)
router.delete("/:id", transactionController.remove);

export default router;
