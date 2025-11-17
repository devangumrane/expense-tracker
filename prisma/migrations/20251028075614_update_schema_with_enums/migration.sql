/*
  Warnings:

  - You are about to drop the column `category` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `merchant_mappings` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_mode` on the `transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,category_id]` on the table `budgets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category_id` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `merchant_mappings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `transaction_type` on the `transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- DropIndex
DROP INDEX "public"."budgets_user_id_category_key";

-- DropIndex
DROP INDEX "public"."categories_name_key";

-- DropIndex
DROP INDEX "public"."merchant_mappings_user_id_category_idx";

-- DropIndex
DROP INDEX "public"."transactions_user_id_category_idx";

-- AlterTable
ALTER TABLE "budgets" DROP COLUMN "category",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "name",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" "CategoryType" NOT NULL,
ADD COLUMN     "user_id" TEXT;

-- AlterTable
ALTER TABLE "merchant_mappings" DROP COLUMN "category",
ADD COLUMN     "category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "category",
DROP COLUMN "payment_mode",
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "payment_method_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "transaction_type",
ADD COLUMN     "transaction_type" "TransactionType" NOT NULL;

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_code_key" ON "payment_methods"("code");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_category_id_key" ON "budgets"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE INDEX "categories_user_id_type_idx" ON "categories"("user_id", "type");

-- CreateIndex
CREATE INDEX "categories_is_system_is_active_idx" ON "categories"("is_system", "is_active");

-- CreateIndex
CREATE INDEX "merchant_mappings_user_id_category_id_idx" ON "merchant_mappings"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_category_id_idx" ON "transactions"("user_id", "category_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_transaction_type_idx" ON "transactions"("user_id", "transaction_type");

-- CreateIndex
CREATE INDEX "transactions_payment_method_id_idx" ON "transactions"("payment_method_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
