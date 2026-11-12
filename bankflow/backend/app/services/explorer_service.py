import math
from typing import Optional, List, Dict, Any
from fastapi import HTTPException
from app.database import get_db_cursor, serialize_row
from app.schemas.explorer import (
    TableInfo,
    TablesListResponse,
    TableDataResponse,
)

ALLOWED_TABLES: Dict[str, Dict[str, str]] = {
    "gold_transaction_summary": {
        "display_name": "Transaction Summary",
        "description": "Aggregated transaction volume, success/fail counts and amounts grouped by type and status.",
    },
    "gold_customer_summary": {
        "display_name": "Customer Summary",
        "description": "Customer-level transaction metrics, total amounts, and customer tier segments.",
    },
    "gold_branch_summary": {
        "display_name": "Branch Summary",
        "description": "Branch performance, branch type, transaction volumes, and financial turnover.",
    },
    "gold_channel_summary": {
        "display_name": "Channel Summary",
        "description": "Performance metrics across channels: Mobile Banking, ATM, Branch, and Internet Banking.",
    },
    "gold_daily_summary": {
        "display_name": "Daily Summary",
        "description": "Daily aggregated volumes, success/failure breakdown, and monetary turnover.",
    },
    "gold_account_summary": {
        "display_name": "Account Summary",
        "description": "Account-level summary with customer association, branch details, and transaction volume.",
    },
}

class ExplorerService:
    @staticmethod
    def get_tables_metadata() -> TablesListResponse:
        tables_info: List[TableInfo] = []
        with get_db_cursor() as cur:
            for table_name, meta in ALLOWED_TABLES.items():
                # Get column names
                cur.execute("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = %s 
                    ORDER BY ordinal_position;
                """, (table_name,))
                columns = [r["column_name"] for r in cur.fetchall()]
                
                # Get row count
                cur.execute(f"SELECT COUNT(*) AS cnt FROM {table_name};")
                row_res = cur.fetchone()
                row_count = int(row_res["cnt"]) if row_res else 0
                
                tables_info.append(
                    TableInfo(
                        table_name=table_name,
                        display_name=meta["display_name"],
                        description=meta["description"],
                        row_count=row_count,
                        columns=columns,
                    )
                )
        return TablesListResponse(tables=tables_info)

    @staticmethod
    def get_table_data(
        table_name: str,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
    ) -> TableDataResponse:
        if table_name not in ALLOWED_TABLES:
            raise HTTPException(
                status_code=400,
                detail=f"Table '{table_name}' is not in the allowed Gold tables list.",
            )

        page = max(1, page)
        limit = max(1, min(100, limit))
        offset = (page - 1) * limit
        order = "DESC" if sort_order.lower() == "desc" else "ASC"

        with get_db_cursor() as cur:
            # 1. Fetch column names and types
            cur.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = %s 
                ORDER BY ordinal_position;
            """, (table_name,))
            cols_info = cur.fetchall()
            columns = [c["column_name"] for c in cols_info]
            text_columns = [
                c["column_name"]
                for c in cols_info
                if "char" in c["data_type"] or "text" in c["data_type"]
            ]

            # 2. Build Search Clause
            where_clauses = []
            params: List[Any] = []
            if search and search.strip():
                search_term = f"%{search.strip()}%"
                search_subclauses = []
                # Search across text columns or cast non-text columns if necessary
                target_cols = text_columns if text_columns else columns[:3]
                for col in target_cols:
                    search_subclauses.append(f"{col}::text ILIKE %s")
                    params.append(search_term)
                if search_subclauses:
                    where_clauses.append(f"({' OR '.join(search_subclauses)})")

            where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ""

            # 3. Get Total Filtered Count
            count_query = f"SELECT COUNT(*) AS total FROM {table_name} {where_sql};"
            cur.execute(count_query, params)
            total_records = int(cur.fetchone()["total"])
            total_pages = math.ceil(total_records / limit) if total_records > 0 else 1

            # 4. Sorting
            if sort_by and sort_by in columns:
                order_clause = f"ORDER BY {sort_by} {order}"
            else:
                # Default order by first column
                order_clause = f"ORDER BY {columns[0]} {order}"

            # 5. Data query with LIMIT and OFFSET
            data_query = f"""
                SELECT * 
                FROM {table_name} 
                {where_sql} 
                {order_clause} 
                LIMIT %s OFFSET %s;
            """
            cur.execute(data_query, params + [limit, offset])
            raw_rows = cur.fetchall()
            rows = [serialize_row(r) for r in raw_rows]

        return TableDataResponse(
            table_name=table_name,
            page=page,
            limit=limit,
            total_records=total_records,
            total_pages=total_pages,
            columns=columns,
            rows=rows,
            search=search,
            sort_by=sort_by,
            sort_order=order.lower(),
        )

