
import pandas as pd
import random
from pathlib import Path
from datetime import datetime, timedelta
import uuid

# =====================================
# BANKFLOW SYNTHETIC DATA GENERATOR
# =====================================

random.seed(42)

OUTPUT_DIR = Path("data/generated")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TOTAL_CUSTOMERS = 10_000
TOTAL_ACCOUNTS = 15_000
TOTAL_TRANSACTIONS = 100_000
TOTAL_BRANCHES = 20

CITIES = [
    "Jakarta", "Semarang", "Bandung", "Surabaya",
    "Yogyakarta", "Medan", "Makassar", "Denpasar",
    "Palembang", "Malang", "Solo", "Bogor"
]

FIRST_NAMES = [
    "Andi", "Budi", "Citra", "Dewi", "Eko",
    "Fajar", "Gita", "Hendra", "Indah", "Joko",
    "Kevin", "Lina", "Maya", "Nanda", "Putri",
    "Rizky", "Sinta", "Taufik", "Wulan", "Yusuf"
]

LAST_NAMES = [
    "Pratama", "Saputra", "Wijaya", "Permata",
    "Nugraha", "Setiawan", "Putri", "Kusuma",
    "Hidayat", "Ramadhan"
]

# =====================================
# 1. GENERATE BRANCHES
# =====================================

branches = []

for i in range(1, TOTAL_BRANCHES + 1):
    city = random.choice(CITIES)

    branches.append({
        "branch_id": f"BR{i:03d}",
        "branch_name": f"BankFlow Branch {i:03d}",
        "city": city,
        "branch_type": random.choice(["MAIN", "SUB", "ATM_CENTER"])
    })

branches_df = pd.DataFrame(branches)

# =====================================
# 2. GENERATE CUSTOMERS
# =====================================

customers = []

for i in range(1, TOTAL_CUSTOMERS + 1):
    customers.append({
        "customer_id": f"CUST{i:06d}",
        "customer_name": f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
        "gender": random.choice(["M", "F"]),
        "city": random.choice(CITIES),
        "registration_date": (
            datetime(2020, 1, 1) +
            timedelta(days=random.randint(0, 2500))
        ).date(),
        "customer_segment": random.choice([
            "REGULAR", "PREMIUM", "PRIORITY"
        ])
    })

customers_df = pd.DataFrame(customers)

# =====================================
# 3. GENERATE ACCOUNTS
# =====================================

accounts = []

for i in range(1, TOTAL_ACCOUNTS + 1):
    customer = random.choice(customers)
    branch = random.choice(branches)

    accounts.append({
        "account_id": f"ACC{i:08d}",
        "customer_id": customer["customer_id"],
        "branch_id": branch["branch_id"],
        "account_type": random.choice([
            "SAVINGS", "CURRENT", "PAYROLL"
        ]),
        "account_status": random.choice([
            "ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE"
        ]),
        "opening_balance": random.randint(100_000, 100_000_000)
    })

accounts_df = pd.DataFrame(accounts)

# =====================================
# 4. GENERATE TRANSACTIONS
# =====================================

transactions = []

start_date = datetime(2025, 1, 1)
end_date = datetime(2025, 12, 31)

transaction_types = [
    "TRANSFER", "WITHDRAWAL", "DEPOSIT",
    "PAYMENT", "PURCHASE"
]

for i in range(1, TOTAL_TRANSACTIONS + 1):
    account = random.choice(accounts)
    transaction_date = start_date + timedelta(
        seconds=random.randint(
            0, int((end_date - start_date).total_seconds())
        )
    )

    amount = random.choice([
        random.randint(10_000, 500_000),
        random.randint(500_001, 5_000_000),
        random.randint(5_000_001, 50_000_000)
    ])

    transactions.append({
        "transaction_id": f"TRX{i:09d}",
        "account_id": account["account_id"],
        "customer_id": account["customer_id"],
        "branch_id": account["branch_id"],
        "transaction_date": transaction_date,
        "transaction_type": random.choice(transaction_types),
        "amount": amount,
        "status": random.choices(
            ["SUCCESS", "FAILED", "PENDING"],
            weights=[92, 6, 2],
            k=1
        )[0],
        "channel": random.choice([
            "MOBILE_BANKING", "ATM", "BRANCH", "INTERNET_BANKING"
        ])
    })

transactions_df = pd.DataFrame(transactions)

# =====================================
# 5. EXPORT CSV
# =====================================

datasets = {
    "branches.csv": branches_df,
    "customers.csv": customers_df,
    "accounts.csv": accounts_df,
    "transactions.csv": transactions_df
}

for filename, dataframe in datasets.items():
    output_path = OUTPUT_DIR / filename
    dataframe.to_csv(output_path, index=False)
    print(f"Generated {filename}: {len(dataframe):,} rows")

print("\n================================")
print("BANKFLOW DATA GENERATION DONE")
print("================================")
print(f"Customers    : {len(customers_df):,}")
print(f"Accounts     : {len(accounts_df):,}")
print(f"Branches     : {len(branches_df):,}")
print(f"Transactions : {len(transactions_df):,}")
