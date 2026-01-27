CREATE OR REPLACE TABLE PORTFOLIO_DE.CLEAN.store_sales AS
SELECT
  ss_sold_date_sk,
  ss_item_sk,
  ss_quantity,
  ss_sales_price,
  ss_ext_sales_price,
  ss_ext_discount_amt,
  ss_net_paid
FROM PORTFOLIO_DE.RAW.store_sales
WHERE ss_sold_date_sk IS NOT NULL
  AND ss_item_sk IS NOT NULL;

CREATE OR REPLACE TABLE PORTFOLIO_DE.CLEAN.date_dim AS
SELECT
  d_date_sk,
  d_date,
  d_year,
  d_moy,
  d_dom
FROM PORTFOLIO_DE.RAW.date_dim;

CREATE OR REPLACE TABLE PORTFOLIO_DE.CLEAN.item AS
SELECT
  i_item_sk,
  i_item_id,
  i_item_desc,
  i_category,
  i_class,
  i_brand
FROM PORTFOLIO_DE.RAW.item;
