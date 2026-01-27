-- A) Revenue per month
-- SELECT
--   d.d_year,
--   d.d_moy,
--   SUM(f.net_sales) AS revenue
-- FROM PORTFOLIO_DE.ANALYTICS.fact_store_sales f
-- JOIN PORTFOLIO_DE.ANALYTICS.dim_date d
--   ON f.date_sk = d.d_date_sk
-- GROUP BY 1,2
-- ORDER BY 1,2;


-- B) Top categories
SELECT
  i.i_category,
  SUM(f.net_sales) AS revenue
FROM PORTFOLIO_DE.ANALYTICS.fact_store_sales f
JOIN PORTFOLIO_DE.ANALYTICS.dim_item i
  ON f.item_sk = i.i_item_sk
GROUP BY 1
ORDER BY 2 DESC
LIMIT 20;
