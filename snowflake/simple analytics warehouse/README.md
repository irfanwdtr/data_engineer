# Snowflake Data Engineering Portfolio (No External Integration)

## Goal
Build a simple analytics warehouse using Snowflake-native sample data.

## Data Source
SNOWFLAKE_SAMPLE_DATA (TPC-DS)

## Architecture
RAW → CLEAN → ANALYTICS (Star Schema)

## Features Demonstrated
- Virtual Warehouse (cost controls)
- Layered schemas (RAW/CLEAN/ANALYTICS)
- ELT transformations using SQL
- Dimensional modeling (fact/dim)
- Basic RBAC for analyst access

## Outputs
- Monthly revenue trend
- Top product categories by revenue
