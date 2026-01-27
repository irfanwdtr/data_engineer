CREATE OR REPLACE TABLE PORTFOLIO_DE.ANALYTICS.dim_date AS
SELECT * FROM PORTFOLIO_DE.CLEAN.date_dim;

CREATE OR REPLACE TABLE PORTFOLIO_DE.ANALYTICS.dim_item AS
SELECT * FROM PORTFOLIO_DE.CLEAN.item;

CREATE OR REPLACE TABLE PORTFOLIO_DE.ANALYTICS.fact_store_sales AS
SELECT
  ss_sold_date_sk AS date_sk,
  ss_item_sk      AS item_sk,
  ss_quantity     AS qty,
  ss_ext_sales_price AS gross_sales,
  ss_ext_discount_amt AS discount,
  ss_net_paid     AS net_sales
FROM PORTFOLIO_DE.CLEAN.store_sales;
