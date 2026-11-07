CREATE TABLE IF NOT EXISTS stock_prices (
    id BIGSERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,

    open NUMERIC(15, 2),
    high NUMERIC(15, 2),
    low NUMERIC(15, 2),
    close NUMERIC(15, 2),
    volume BIGINT,

    dividends NUMERIC(15, 4) DEFAULT 0,
    stock_splits NUMERIC(15, 4) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (ticker, trade_date)
);

CREATE TABLE IF NOT EXISTS stock_features (
    id BIGSERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    trade_date DATE NOT NULL,

    daily_return NUMERIC(12, 6),
    sma_5 NUMERIC(15, 2),
    sma_10 NUMERIC(15, 2),
    sma_20 NUMERIC(15, 2),
    rsi_14 NUMERIC(8, 4),
    volatility_20 NUMERIC(12, 6),
    volume_ratio_20 NUMERIC(12, 6),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (ticker, trade_date)
);