import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import col, to_date, year, month, dayofmonth

# ========================
# PARAMETERS
# ========================
args = getResolvedOptions(sys.argv, ['JOB_NAME','processing_date'])
processing_date = args['processing_date']

bucket = "glue-belajar-irfan"
input_path = f"s3://{bucket}/raw/sales/{processing_date}/sales_data.csv"

out_dim_customer = f"s3://{bucket}/processed/dim_customer/"
out_dim_product  = f"s3://{bucket}/processed/dim_product/"
out_fact_sales   = f"s3://{bucket}/processed/fact_sales/"

# ========================
# INIT SPARK
# ========================
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# ========================
# EXTRACT
# ========================
df = (
    spark.read
    .option("header", "true")
    .option("inferSchema", "true")
    .csv(input_path)
)

print("✅ Loaded rows:", df.count())

# ========================
# TRANSFORM
# ========================
df = df.withColumn("order_date", to_date(col("order_date")))
df = df.withColumn("total_amount", col("quantity") * col("price"))

df = (
    df.withColumn("year", year(col("order_date")))
      .withColumn("month", month(col("order_date")))
      .withColumn("day", dayofmonth(col("order_date")))
)

# ========================
# DIM TABLES
# ========================

dim_customer = (
    df.select("customer_name", "city")
      .dropDuplicates()
)

dim_product = (
    df.select("product", "category")
      .dropDuplicates()
)

# ========================
# LOAD DIM (APPEND)
# ========================
(dim_customer.write
    .mode("append")
    .parquet(out_dim_customer)
)

(dim_product.write
    .mode("append")
    .parquet(out_dim_product)
)

# ========================
# LOAD FACT (APPEND + PARTITION)
# ========================
(df.write
   .mode("append")
   .partitionBy("year", "month", "day")
   .parquet(out_fact_sales)
)

print("✅ All tables written successfully")

job.commit()
