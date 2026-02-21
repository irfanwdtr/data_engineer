# 📊 Data Warehouse Project – Pentaho PDI (MySQL)

##  Overview

Project ini merupakan implementasi mini Data Warehouse menggunakan **Pentaho Data Integration (PDI / Spoon)** dengan database **MySQL**.

Pipeline ini membangun arsitektur **Star Schema** yang terdiri dari:

- Staging Layer
- Dimension Tables
- Fact Table
- Surrogate Key Lookup
- ETL Orchestration per transformation

Project ini mensimulasikan sistem transaksi retail (POS) yang diproses menjadi model analitik siap BI.

---

#  Arsitektur Data Warehouse

##  Layer 1 – Staging

Source data:
- MySQL (pos_sales)
- CSV (promo_adjustments)

Diproses menjadi:
#  Data Warehouse Project – Pentaho PDI (MySQL)

##  Overview

Project ini merupakan implementasi mini Data Warehouse menggunakan **Pentaho Data Integration (PDI / Spoon)** dengan database **MySQL**.

Pipeline ini membangun arsitektur **Star Schema** yang terdiri dari:

- Staging Layer
- Dimension Tables
- Fact Table
- Surrogate Key Lookup
- ETL Orchestration per transformation

Project ini mensimulasikan sistem transaksi retail (POS) yang diproses menjadi model analitik siap BI.

---

#  Arsitektur Data Warehouse

##  Layer 1 – Staging

Source data:
- MySQL (pos_sales)
- CSV (promo_adjustments)

Diproses menjadi:
stg_sales_enriched


Berisi:
- trx_id
- trx_datetime
- trx_date
- customer_name
- product_name
- store_city
- qty
- price
- discount_pct
- gross_sales
- discount_amount
- net_sales

---


##  Layer 2 – Dimension Tables

###  dim_date
| Column |
|--------|
| date_key (PK) |
| full_date |
| day |
| month |
| month_name |
| quarter |
| year |

---

###  dim_customer
| Column |
|--------|
| customer_key (PK) |
| customer_name |

---

### dim_product
| Column |
|--------|
| product_key (PK) |
| product_name |

---

###  dim_store
| Column |
|--------|
| store_key (PK) |
| store_city |

---

##  Layer 3 – Fact Table

###  fact_sales

| Column |
|--------|
| sales_key (PK) |
| trx_id |
| trx_datetime |
| date_key (FK) |
| customer_key (FK) |
| product_key (FK) |
| store_key (FK) |
| qty |
| price |
| discount_pct |
| gross_sales |
| discount_amount |
| net_sales |

Fact table menggunakan **surrogate key dari dimension table** untuk optimasi join dan performa query.

---

#  ETL Flow (Pentaho PDI)

## 01 – Staging Transformation
- Read MySQL transaction data
- Read CSV promo data
- Stream Lookup join berdasarkan trx_id
- Hitung gross_sales
- Hitung discount_amount
- Hitung net_sales
- Generate trx_date (date only)
- Load ke `stg_sales_enriched`
- 
![1](1.png)
---

## 02 – Build dim_date
- Ambil DISTINCT trx_date
- Generate:
  - date_key (YYYYMMDD)
  - day, month, quarter, year
  - month_name
- Insert / Update ke dim_date

![2](2.png)
---

## 03 – Build dim_customer
- SELECT DISTINCT customer_name
- Insert / Update ke dim_customer
- 
![3](3.png)
---

## 04 – Build dim_product
- SELECT DISTINCT product_name
- Insert / Update ke dim_product

![4](4.png)
---

## 05 – Build dim_store
- SELECT DISTINCT store_city
- Insert / Update ke dim_store

![5](5.png)
---

## 06 – Build fact_sales
- Ambil data dari staging
- Stream Lookup ke:
  - dim_customer
  - dim_product
  - dim_store
  - dim_date
- Retrieve surrogate keys
- Load ke fact_sales
- 
![6](6.png)
---

#  Star Schema Diagram (Conceptual)
```
         dim_customer
               |
         dim_product
               |
dim_date ---- fact_sales ---- dim_store
```


Fact table berada di tengah dan terhubung ke semua dimension table menggunakan foreign key.


---

#  Key Concepts Implemented

##  ETL vs ELT
Project ini menggunakan pendekatan ETL klasik dengan Pentaho PDI.

## Surrogate Key
Semua dimension menggunakan auto-increment integer sebagai primary key.

##  Stream Lookup
Digunakan untuk mengganti natural key (nama) menjadi surrogate key.

##  Star Schema Design
Optimized untuk analytical query & BI reporting.

##  Layered Architecture
Source → Staging → Dimension → Fact

![sql](sql.png)

---

#  Tools & Technology

- Pentaho Data Integration (Spoon)
- MySQL
- CSV File Input
- Stream Lookup
- Insert / Update
- Table Output



#  Status

✅ Staging Loaded  
✅ Dimensions Loaded  
✅ Fact Table Loaded  
✅ Surrogate Key Lookup Working  
✅ Full Star Schema Implemented  

Project berhasil membangun mini Data Warehouse end-to-end menggunakan Pentaho.

---

# 👨‍💻 Author

Built as hands-on ETL & Data Warehouse practice project using Pentaho PDI.
