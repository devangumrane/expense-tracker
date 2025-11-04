// src/services/transaction/transaction.service.js

import prisma from '../../models/index.js';

// Create a transaction
export const createTransaction = async (data) => {
  return await prisma.transaction.create({
    data: {
      userId: data.userId,
      transactionType: data.transactionType, // INCOME or EXPENSE
      amount: data.amount,
      currency: data.currency || 'INR',
      categoryId: data.categoryId,
      subcategory: data.subcategory,
      merchantName: data.merchantName,
      merchantNormalized: data.merchantName?.toLowerCase().trim(),
      description: data.description,
      paymentMethodId: data.paymentMethodId,
      accountLast4: data.accountLast4,
      referenceId: data.referenceId,
      transactionDate: data.transactionDate || new Date(),
      parsingMethod: data.parsingMethod || 'manual',
      confidenceScore: data.confidenceScore,
    },
    include: {
      category: true,
      paymentMethod: true,
    },
  });
};

// Get all transactions for a user with filters
export const getTransactionsByUser = async (userId, filters = {}) => {
  const { startDate, endDate, categoryId, transactionType, limit = 50 } = filters;

  return await prisma.transaction.findMany({
    where: {
      userId,
      ...(startDate && { transactionDate: { gte: new Date(startDate) } }),
      ...(endDate && { transactionDate: { lte: new Date(endDate) } }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(transactionType && { transactionType }),
    },
    include: {
      category: {
        select: {
          id: true,
          code: true,
          displayName: true,
          icon: true,
          colorHex: true,
        },
      },
      paymentMethod: {
        select: {
          id: true,
          code: true,
          displayName: true,
          icon: true,
        },
      },
    },
    orderBy: { transactionDate: 'desc' },
    take: limit,
  });
};

// Get transaction by ID
export const getTransactionById = async (id, userId) => {
  return await prisma.transaction.findFirst({
    where: { 
      id, // UUID string
      userId, // Ensure user owns this transaction
    },
    include: {
      category: true,
      paymentMethod: true,
    },
  });
};

// Update transaction
export const updateTransaction = async (id, userId, data) => {
  // First verify ownership
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Transaction not found or access denied');
  }

  return await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.subcategory !== undefined && { subcategory: data.subcategory }),
      ...(data.amount && { amount: data.amount }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.merchantName && { 
        merchantName: data.merchantName,
        merchantNormalized: data.merchantName.toLowerCase().trim(),
      }),
      ...(data.paymentMethodId && { paymentMethodId: data.paymentMethodId }),
      ...(data.transactionDate && { transactionDate: new Date(data.transactionDate) }),
      userCorrected: true, // Mark as user-edited
    },
    include: {
      category: true,
      paymentMethod: true,
    },
  });
};

// Delete transaction
export const deleteTransaction = async (id, userId) => {
  // Verify ownership first
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('Transaction not found or access denied');
  }

  return await prisma.transaction.delete({
    where: { id },
  });
};

// Get transaction summary for a user
export const getTransactionSummary = async (userId, startDate, endDate) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    transactionCount: transactions.length,
    byCategory: {},
  };

  transactions.forEach((t) => {
    if (t.transactionType === 'INCOME') {
      summary.totalIncome += Number(t.amount);
    } else {
      summary.totalExpense += Number(t.amount);
    }

    // Group by category
    const catId = t.categoryId;
    if (!summary.byCategory[catId]) {
      summary.byCategory[catId] = 0;
    }
    summary.byCategory[catId] += Number(t.amount);
  });

  summary.netBalance = summary.totalIncome - summary.totalExpense;

  return summary;
};
