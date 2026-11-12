
-- =========================================
-- 1. TRANSACTION SUMMARY
-- =========================================

CREATE TABLE IF NOT EXISTS gold_transaction_summary (
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    successful_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    pending_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    successful_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    average_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (transaction_type, status)
);

ALTER TABLE gold_transaction_summary
    ADD COLUMN IF NOT EXISTS successful_transactions BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS failed_transactions BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS pending_transactions BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS successful_amount NUMERIC(18,2) NOT NULL DEFAULT 0;


-- =========================================
-- 2. CUSTOMER SUMMARY
-- =========================================

CREATE TABLE IF NOT EXISTS gold_customer_summary (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(150),
    city VARCHAR(100),
    customer_segment VARCHAR(50),
    total_transactions BIGINT NOT NULL DEFAULT 0,
    successful_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    pending_transactions BIGINT NOT NULL DEFAULT 0,
    total_transaction_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    successful_transaction_amount NUMERIC(18,2) NOT NULL DEFAULT 0
);

ALTER TABLE gold_customer_summary
    ADD COLUMN IF NOT EXISTS pending_transactions BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS customer_segment VARCHAR(50);


-- =========================================
-- 3. BRANCH SUMMARY
-- =========================================

CREATE TABLE IF NOT EXISTS gold_branch_summary (
    branch_id VARCHAR(50) PRIMARY KEY,
    branch_name VARCHAR(150),
    city VARCHAR(100),
    branch_type VARCHAR(50),
    total_transactions BIGINT NOT NULL DEFAULT 0,
    successful_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    pending_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    successful_amount NUMERIC(18,2) NOT NULL DEFAULT 0
);


-- =========================================
-- 4. CHANNEL SUMMARY
-- =========================================

CREATE TABLE IF NOT EXISTS gold_channel_summary (
    channel VARCHAR(50) PRIMARY KEY,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    successful_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    pending_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    successful_amount NUMERIC(18,2) NOT NULL DEFAULT 0
);


-- =========================================
-- 5. DAILY SUMMARY
-- =========================================

CREATE TABLE IF NOT EXISTS gold_daily_summary (
    transaction_date DATE PRIMARY KEY,
    total_transactions BIGINT NOT NULL DEFAULT 0,
    successful_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    pending_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    successful_amount NUMERIC(18,2) NOT NULL DEFAULT 0
);


-- =========================================
-- 6. ACCOUNT SUMMARY
-- =========================================

CREATE TABLE IF NOT EXISTS gold_account_summary (
    account_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50),
    branch_id VARCHAR(50),
    account_type VARCHAR(50),
    account_status VARCHAR(50),
    opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
    customer_name VARCHAR(150),
    city VARCHAR(100),
    branch_name VARCHAR(150),
    total_transactions BIGINT NOT NULL DEFAULT 0,
    successful_transactions BIGINT NOT NULL DEFAULT 0,
    failed_transactions BIGINT NOT NULL DEFAULT 0,
    pending_transactions BIGINT NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    successful_amount NUMERIC(18,2) NOT NULL DEFAULT 0
);


-- =========================================
-- 7. INDEXES FOR POWER BI QUERY PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_gold_customer_city
    ON gold_customer_summary(city);

CREATE INDEX IF NOT EXISTS idx_gold_customer_segment
    ON gold_customer_summary(customer_segment);

CREATE INDEX IF NOT EXISTS idx_gold_branch_city
    ON gold_branch_summary(city);

CREATE INDEX IF NOT EXISTS idx_gold_account_customer
    ON gold_account_summary(customer_id);

CREATE INDEX IF NOT EXISTS idx_gold_account_branch
    ON gold_account_summary(branch_id);
