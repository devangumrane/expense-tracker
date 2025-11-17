-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('MANUAL', 'SMS', 'BANK', 'API');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "transaction_source" "SourceType" NOT NULL DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login" TIMESTAMP(3),
ADD COLUMN     "profile_picture" TEXT;

-- CreateIndex
CREATE INDEX "transactions_transaction_date_transaction_type_idx" ON "transactions"("transaction_date", "transaction_type");

-- CreateIndex
CREATE INDEX "transactions_user_id_category_id_transaction_type_idx" ON "transactions"("user_id", "category_id", "transaction_type");
