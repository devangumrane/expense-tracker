// src/controllers/transaction.controller.js

import * as transactionService from '../services/transaction/transaction.service.js';

export const create = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token

    // Validate required fields
    const { transactionType, amount, categoryId } = req.body;
    if (!transactionType || !amount || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['transactionType', 'amount', 'categoryId']
      });
    }

    // Validate transaction type
    const validTypes = ['INCOME', 'EXPENSE'];
    if (!validTypes.includes(transactionType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transactionType',
        validTypes
      });
    }

    // Call service to create transaction
    const transaction = await transactionService.createTransaction({
      ...req.body,
      userId, // Add userId from token
    });

    res.status(201).json({
      success: true,
      data: transaction, 
    });

  } catch (error) {
    console.error('❌ Transaction creation error:', error);
    
    // Handle Prisma foreign key errors
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        error: 'Invalid foreign key',
        message: 'Category or PaymentMethod does not exist'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create transaction',
      message: error.message,
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      categoryId: req.query.categoryId,
      transactionType: req.query.type, // Note: query param is 'type'
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
    };

    const transactions = await transactionService.getTransactionsByUser(userId, filters);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });

  } catch (error) {
    console.error('❌ Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message,
    });
  }
};

export const getSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    // Default to current month if not provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();

    const summary = await transactionService.getTransactionSummary(userId, start, end);

    res.json({
      success: true,
      data: summary,
    });

  } catch (error) {
    console.error('❌ Get summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary',
      message: error.message,
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const transaction = await transactionService.getTransactionById(id, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });

  } catch (error) {
    console.error('❌ Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const transaction = await transactionService.updateTransaction(id, userId, req.body);

    res.json({
      success: true,
      data: transaction,
    });

  } catch (error) {
    console.error('❌ Update transaction error:', error);
    
    if (error.message === 'Transaction not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update transaction',
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await transactionService.deleteTransaction(id, userId);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });

  } catch (error) {
    console.error('❌ Delete transaction error:', error);
    
    if (error.message === 'Transaction not found or access denied') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction',
      message: error.message,
    });
  }
};