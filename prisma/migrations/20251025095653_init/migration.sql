-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT,
    "phone_number" TEXT,
    "monthly_income" DECIMAL(12,2),
    "currency_preference" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "merchant_name" TEXT,
    "merchant_normalized" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "payment_mode" TEXT,
    "account_last4" TEXT,
    "reference_id" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sms_sender" TEXT,
    "sms_hash" TEXT,
    "confidence_score" DECIMAL(3,2),
    "parsing_method" TEXT,
    "user_corrected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color_hex" TEXT NOT NULL,
    "parent_id" INTEGER,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_mappings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "merchant_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "confidence_score" DECIMAL(3,2),
    "times_corrected" INTEGER NOT NULL DEFAULT 0,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthly_limit" DECIMAL(10,2) NOT NULL,
    "alert_threshold" DECIMAL(3,2) NOT NULL DEFAULT 0.80,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_insights" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_spent" DECIMAL(12,2) NOT NULL,
    "total_earned" DECIMAL(12,2) NOT NULL,
    "transaction_count" INTEGER NOT NULL,
    "avg_transaction" DECIMAL(10,2) NOT NULL,
    "category_breakdown" JSONB NOT NULL,
    "spending_trend" TEXT NOT NULL,
    "top_merchants" JSONB NOT NULL,
    "anomalies" JSONB,
    "recommendations" TEXT[],
    "health_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_sms_hash_key" ON "transactions"("sms_hash");

-- CreateIndex
CREATE INDEX "transactions_user_id_transaction_date_idx" ON "transactions"("user_id", "transaction_date" DESC);

-- CreateIndex
CREATE INDEX "transactions_user_id_category_idx" ON "transactions"("user_id", "category");

-- CreateIndex
CREATE INDEX "transactions_sms_hash_idx" ON "transactions"("sms_hash");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "merchant_mappings_user_id_category_idx" ON "merchant_mappings"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_mappings_user_id_merchant_name_key" ON "merchant_mappings"("user_id", "merchant_name");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_user_id_category_key" ON "budgets"("user_id", "category");

-- CreateIndex
CREATE INDEX "user_insights_user_id_period_start_idx" ON "user_insights"("user_id", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "user_insights_user_id_period_start_period_end_key" ON "user_insights"("user_id", "period_start", "period_end");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_mappings" ADD CONSTRAINT "merchant_mappings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_insights" ADD CONSTRAINT "user_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
