import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new transaction for the authenticated user
export const create = async (req, res, next) => {
  try {
    const { amount, type, categoryId, date, note } = req.validated.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount,
        transactionType: type,
        categoryId,
        description: note || "",
        transactionDate: new Date(date),

        // Advanced fields with defaults
        currency: "INR",
        paymentMethodId: null,
        merchantName: null,
        merchantNormalized: null,
        subcategory: null,
        tags: [],
        accountLast4: null,
        referenceId: null,
        smsSender: null,
        smsHash: null,
        confidenceScore: null,
        parsingMethod: "MANUAL",
        userCorrected: false,
        transactionSource: "MANUAL",
      },
    });

    return res.success(transaction, "Transaction created", 201);
  } catch (err) {
    next(err);
  }
};

// Get all transactions for the authenticated user
export const getAll = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        isDeleted: false,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    return res.success(transactions, "Transactions fetched");
  } catch (err) {
    next(err);
  }
};

// Get one transaction by ID for the authenticated user
export const getOne = async (req, res, next) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
        isDeleted: false,
      },
    });

    if (!transaction) {
      return res.fail("Transaction not found", 404);
    }

    return res.success(transaction, "Transaction fetched");
  } catch (err) {
    next(err);
  }
};

// Update a transaction by ID for the authenticated user
export const update = async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id, isDeleted: false },
    });

    if (!existing) {
      return res.fail("Transaction not found", 404);
    }

    const { amount, type, categoryId, date, note } = req.validated.body;

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        amount,
        transactionType: type,
        categoryId,
        description: note || "",
        transactionDate: new Date(date),
      },
    });

    return res.success(updated, "Transaction updated");
  } catch (err) {
    next(err);
  }
};


// Soft delete a transaction by ID for the authenticated user\
export const remove = async (req, res, next) => {
  try {
    const existing = await prisma.transaction.findFirst({
      where: { id: req.params.id, userId: req.user.id, isDeleted: false },
    });

    if (!existing) {
      return res.fail("Transaction not found", 404);
    }

    await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return res.success(null, "Transaction deleted");
  } catch (err) {
    next(err);
  }
};

// Get summary analytics for the authenticated user
export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const income = await prisma.transaction.aggregate({
      where: { userId, transactionType: "INCOME", isDeleted: false },
      _sum: { amount: true },
    });

    const expense = await prisma.transaction.aggregate({
      where: { userId, transactionType: "EXPENSE", isDeleted: false },
      _sum: { amount: true },
    });

    const summary = {
      totalIncome: income._sum.amount || 0,
      totalExpense: expense._sum.amount || 0,
      balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
    };

    return res.success(summary, "Summary fetched");
  } catch (err) {
    next(err);
  }
};
