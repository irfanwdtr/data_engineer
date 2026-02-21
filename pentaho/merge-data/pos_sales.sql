-- POS Sales sample data (MySQL)
DROP TABLE IF EXISTS pos_sales;
CREATE TABLE pos_sales (
  trx_id VARCHAR(20) PRIMARY KEY,
  trx_datetime DATETIME NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  qty INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  store_city VARCHAR(60) NOT NULL
);

INSERT INTO pos_sales (trx_id, trx_datetime, customer_name, product_name, qty, price, store_city) VALUES
('POS-62980262', '2026-02-02 03:45:00', 'Siti', 'USB-C Cable', 5, 7500000.00, 'Bandung'),
('POS-40771452', '2026-02-02 06:45:00', 'Lina', 'Acer Aspire 5', 2, 12000000.00, 'Bandung'),
('POS-14240392', '2026-02-02 08:10:00', 'Nina', 'Xiaomi Redmi 12', 4, 12000000.00, 'Yogyakarta'),
('POS-96103540', '2026-02-02 13:00:00', 'Agus', 'AirPods Pro', 1, 1200000.00, 'Bandung'),
('POS-44982519', '2026-02-02 13:15:00', 'Dewi', 'AirPods Pro', 5, 299000.00, 'Bandung'),
('POS-29557055', '2026-02-03 00:10:00', 'Fajar', 'Samsung S23', 1, 12000000.00, 'Jakarta Pusat'),
('POS-97467217', '2026-02-03 06:45:00', 'Tono', 'AirPods Pro', 1, 7500000.00, 'Bandung'),
('POS-38826320', '2026-02-03 12:20:00', 'Dewi', 'Xiaomi Redmi 12', 5, 3500000.00, 'Surabaya'),
('POS-14422948', '2026-02-04 00:10:00', 'Fajar', 'iPhone 15', 1, 12000000.00, 'Jakarta Pusat'),
('POS-04207627', '2026-02-04 01:00:00', 'Fajar', 'USB-C Cable', 4, 12000000.00, 'Jakarta Pusat'),
('POS-57503098', '2026-02-05 08:10:00', 'Dewi', 'Samsung S23', 1, 299000.00, 'Jakarta Pusat'),
('POS-10458697', '2026-02-05 11:30:00', 'Rina', 'Xiaomi Redmi 12', 4, 50000.00, 'Surabaya'),
('POS-83276346', '2026-02-05 16:30:00', 'Fajar', 'Acer Aspire 5', 2, 50000.00, 'Surabaya'),
('POS-51302245', '2026-02-07 02:10:00', 'Dewi', 'Logitech M185', 5, 25000.00, 'Surabaya'),
('POS-77442871', '2026-02-07 08:10:00', 'Tono', 'Xiaomi Redmi 12', 3, 125000.00, 'Bandung'),
('POS-70220212', '2026-02-07 12:10:00', 'Agus', 'Samsung S23', 3, 1200000.00, 'Bandung'),
('POS-61956365', '2026-02-08 00:15:00', 'Rina', 'Acer Aspire 5', 4, 125000.00, 'Surabaya'),
('POS-02276804', '2026-02-08 04:00:00', 'Budi', 'iPhone 15', 2, 299000.00, 'Jakarta Pusat'),
('POS-76065242', '2026-02-08 12:15:00', 'Fajar', 'Samsung S23', 3, 25000.00, 'Bandung'),
('POS-63589792', '2026-02-08 15:10:00', 'Siti', 'AirPods Pro', 2, 3500000.00, 'Jakarta Pusat'),
('POS-36384200', '2026-02-08 23:15:00', 'Fajar', 'Samsung S23', 5, 299000.00, 'Jakarta Pusat'),
('POS-57453914', '2026-02-09 07:30:00', 'Budi', 'AirPods Pro', 1, 125000.00, 'Bandung'),
('POS-13332041', '2026-02-09 12:15:00', 'Tono', 'iPhone 15', 5, 499000.00, 'Surabaya'),
('POS-81044476', '2026-02-09 17:20:00', 'Andi', 'iPhone 15', 4, 1200000.00, 'Jakarta Pusat'),
('POS-40395980', '2026-02-09 19:45:00', 'Andi', 'USB-C Cable', 5, 499000.00, 'Surabaya'),
('POS-84095724', '2026-02-10 03:00:00', 'Nina', 'Samsung S23', 3, 125000.00, 'Bandung'),
('POS-00849550', '2026-02-10 10:10:00', 'Andi', 'Acer Aspire 5', 5, 12000000.00, 'Surabaya'),
('POS-18287122', '2026-02-11 07:45:00', 'Agus', 'Samsung S23', 3, 12000000.00, 'Yogyakarta'),
('POS-27236237', '2026-02-11 08:15:00', 'Andi', 'iPhone 15', 4, 50000.00, 'Jakarta Pusat'),
('POS-19192147', '2026-02-11 09:00:00', 'Agus', 'Acer Aspire 5', 5, 12000000.00, 'Jakarta Pusat');
