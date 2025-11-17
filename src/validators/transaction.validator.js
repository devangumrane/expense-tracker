import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(["INCOME", "EXPENSE"], "Invalid transaction type"),
    categoryId: z.number().int("Category ID must be an integer"),
    date: z.string().datetime({ message: "Invalid date format" }),
    note: z.string().optional().default(""),
  }),
});
