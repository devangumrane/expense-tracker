// src/routes/v1/transaction.routes.js
import express from 'express';
import * as transactionController from '../../controllers/transaction.controller.js';
import { verifyToken } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/', transactionController.create);
router.get('/', transactionController.getAll);
router.get('/summary', transactionController.getSummary);
router.get('/:id', transactionController.getOne);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;  