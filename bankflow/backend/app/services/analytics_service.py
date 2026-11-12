from typing import Optional, List, Dict, Any
from app.database import get_db_cursor, serialize_row
from app.schemas.overview import (
    KPIMetrics,
    DailyTrendItem,
    StatusDistributionItem,
    TypeAnalysisItem,
    ChannelPerformanceItem,
    BranchPerformanceItem,
    OverviewResponse,
)
from app.schemas.analytics import CustomerSegmentItem

class AnalyticsService:
    @staticmethod
    def get_kpis() -> KPIMetrics:
        with get_db_cursor() as cur:
            # Get transaction totals from gold_transaction_summary
            cur.execute("""
                SELECT 
                    COALESCE(SUM(total_transactions), 0) AS total_transactions,
                    COALESCE(SUM(successful_transactions), 0) AS successful_transactions,
                    COALESCE(SUM(failed_transactions), 0) AS failed_transactions,
                    COALESCE(SUM(pending_transactions), 0) AS pending_transactions,
                    COALESCE(SUM(successful_amount), 0) AS successful_amount,
                    COALESCE(SUM(total_amount), 0) AS total_amount
                FROM gold_transaction_summary;
            """)
            tx_stats = serialize_row(cur.fetchone() or {})
            
            # Get customer count
            cur.execute("SELECT COUNT(*) AS total_customers FROM gold_customer_summary;")
            cust_res = cur.fetchone()
            total_customers = int(cust_res["total_customers"]) if cust_res else 0
            
            # Get account count
            cur.execute("SELECT COUNT(*) AS total_accounts FROM gold_account_summary;")
            acc_res = cur.fetchone()
            total_accounts = int(acc_res["total_accounts"]) if acc_res else 0
            
            # Get branch count
            cur.execute("SELECT COUNT(*) AS total_branches FROM gold_branch_summary;")
            branch_res = cur.fetchone()
            total_branches = int(branch_res["total_branches"]) if branch_res else 0
            
            total_tx = int(tx_stats.get("total_transactions", 0))
            succ_tx = int(tx_stats.get("successful_transactions", 0))
            fail_tx = int(tx_stats.get("failed_transactions", 0))
            pend_tx = int(tx_stats.get("pending_transactions", 0))
            succ_amt = float(tx_stats.get("successful_amount", 0.0))
            tot_amt = float(tx_stats.get("total_amount", 0.0))
            
            success_rate = round((succ_tx / total_tx * 100), 2) if total_tx > 0 else 0.0
            fail_rate = round((fail_tx / total_tx * 100), 2) if total_tx > 0 else 0.0
            pending_rate = round((pend_tx / total_tx * 100), 2) if total_tx > 0 else 0.0
            
            return KPIMetrics(
                total_transactions=total_tx,
                total_customers=total_customers,
                total_accounts=total_accounts,
                total_branches=total_branches,
                successful_transactions=succ_tx,
                failed_transactions=fail_tx,
                pending_transactions=pend_tx,
                successful_amount=succ_amt,
                total_amount=tot_amt,
                success_rate=success_rate,
                fail_rate=fail_rate,
                pending_rate=pending_rate,
            )

    @staticmethod
    def get_daily_trends(start_date: Optional[str] = None, end_date: Optional[str] = None, limit: Optional[int] = None) -> List[DailyTrendItem]:
        query = """
            SELECT 
                transaction_date,
                total_transactions,
                successful_transactions,
                failed_transactions,
                pending_transactions,
                total_amount,
                successful_amount
            FROM gold_daily_summary
            WHERE 1=1
        """
        params = []
        if start_date:
            query += " AND transaction_date >= %s"
            params.append(start_date)
        if end_date:
            query += " AND transaction_date <= %s"
            params.append(end_date)
            
        query += " ORDER BY transaction_date ASC"
        if limit:
            query += f" LIMIT {int(limit)}"
            
        with get_db_cursor() as cur:
            cur.execute(query, params)
            rows = [serialize_row(r) for r in cur.fetchall()]
            
        return [
            DailyTrendItem(
                date=str(r["transaction_date"]),
                total_transactions=int(r["total_transactions"]),
                successful_transactions=int(r["successful_transactions"]),
                failed_transactions=int(r["failed_transactions"]),
                pending_transactions=int(r["pending_transactions"]),
                total_amount=float(r["total_amount"]),
                successful_amount=float(r["successful_amount"]),
            )
            for r in rows
        ]

    @staticmethod
    def get_status_distribution() -> List[StatusDistributionItem]:
        with get_db_cursor() as cur:
            cur.execute("""
                SELECT 
                    status,
                    SUM(total_transactions) AS count,
                    SUM(total_amount) AS total_amount
                FROM gold_transaction_summary
                GROUP BY status
                ORDER BY count DESC;
            """)
            rows = [serialize_row(r) for r in cur.fetchall()]
            
        total_count = sum(int(r["count"]) for r in rows) or 1
        return [
            StatusDistributionItem(
                status=r["status"],
                count=int(r["count"]),
                percentage=round((int(r["count"]) / total_count) * 100, 2),
                total_amount=float(r["total_amount"]),
            )
            for r in rows
        ]

    @staticmethod
    def get_type_analysis() -> List[TypeAnalysisItem]:
        with get_db_cursor() as cur:
            cur.execute("""
                SELECT 
                    transaction_type,
                    SUM(total_transactions) AS total_transactions,
                    SUM(successful_transactions) AS successful_transactions,
                    SUM(failed_transactions) AS failed_transactions,
                    SUM(pending_transactions) AS pending_transactions,
                    SUM(total_amount) AS total_amount,
                    SUM(successful_amount) AS successful_amount,
                    ROUND(SUM(total_amount) / NULLIF(SUM(total_transactions), 0), 2) AS average_amount
                FROM gold_transaction_summary
                GROUP BY transaction_type
                ORDER BY total_transactions DESC;
            """)
            rows = [serialize_row(r) for r in cur.fetchall()]
            
        items = []
        for r in rows:
            tot = int(r["total_transactions"])
            succ = int(r["successful_transactions"])
            items.append(
                TypeAnalysisItem(
                    transaction_type=r["transaction_type"],
                    total_transactions=tot,
                    successful_transactions=succ,
                    failed_transactions=int(r["failed_transactions"]),
                    pending_transactions=int(r["pending_transactions"]),
                    total_amount=float(r["total_amount"]),
                    successful_amount=float(r["successful_amount"]),
                    average_amount=float(r["average_amount"] or 0.0),
                    success_rate=round((succ / tot * 100), 2) if tot > 0 else 0.0,
                )
            )
        return items

    @staticmethod
    def get_channel_performance() -> List[ChannelPerformanceItem]:
        with get_db_cursor() as cur:
            cur.execute("""
                SELECT 
                    channel,
                    total_transactions,
                    successful_transactions,
                    failed_transactions,
                    pending_transactions,
                    total_amount,
                    successful_amount
                FROM gold_channel_summary
                ORDER BY total_transactions DESC;
            """)
            rows = [serialize_row(r) for r in cur.fetchall()]
            
        items = []
        for r in rows:
            tot = int(r["total_transactions"])
            succ = int(r["successful_transactions"])
            items.append(
                ChannelPerformanceItem(
                    channel=r["channel"],
                    total_transactions=tot,
                    successful_transactions=succ,
                    failed_transactions=int(r["failed_transactions"]),
                    pending_transactions=int(r["pending_transactions"]),
                    total_amount=float(r["total_amount"]),
                    successful_amount=float(r["successful_amount"]),
                    success_rate=round((succ / tot * 100), 2) if tot > 0 else 0.0,
                )
            )
        return items

    @staticmethod
    def get_top_branches(limit: int = 10) -> List[BranchPerformanceItem]:
        with get_db_cursor() as cur:
            cur.execute(f"""
                SELECT 
                    branch_id,
                    branch_name,
                    city,
                    branch_type,
                    total_transactions,
                    successful_transactions,
                    failed_transactions,
                    pending_transactions,
                    total_amount,
                    successful_amount
                FROM gold_branch_summary
                ORDER BY total_transactions DESC
                LIMIT {int(limit)};
            """)
            rows = [serialize_row(r) for r in cur.fetchall()]
            
        items = []
        for r in rows:
            tot = int(r["total_transactions"])
            succ = int(r["successful_transactions"])
            items.append(
                BranchPerformanceItem(
                    branch_id=r["branch_id"],
                    branch_name=r["branch_name"],
                    city=r["city"],
                    branch_type=r["branch_type"],
                    total_transactions=tot,
                    successful_transactions=succ,
                    failed_transactions=int(r["failed_transactions"]),
                    pending_transactions=int(r["pending_transactions"]),
                    total_amount=float(r["total_amount"]),
                    successful_amount=float(r["successful_amount"]),
                    success_rate=round((succ / tot * 100), 2) if tot > 0 else 0.0,
                )
            )
        return items

    @staticmethod
    def get_customer_segments() -> List[CustomerSegmentItem]:
        with get_db_cursor() as cur:
            cur.execute("""
                SELECT 
                    COALESCE(customer_segment, 'UNKNOWN') AS segment,
                    COUNT(DISTINCT customer_id) AS total_customers,
                    SUM(total_transactions) AS total_transactions,
                    SUM(successful_transactions) AS successful_transactions,
                    SUM(failed_transactions) AS failed_transactions,
                    SUM(pending_transactions) AS pending_transactions,
                    SUM(total_transaction_amount) AS total_amount,
                    SUM(successful_transaction_amount) AS successful_amount
                FROM gold_customer_summary
                GROUP BY customer_segment
                ORDER BY total_amount DESC;
            """)
            rows = [serialize_row(r) for r in cur.fetchall()]
            
        items = []
        for r in rows:
            cust_count = int(r["total_customers"]) or 1
            tot_tx = int(r["total_transactions"])
            succ_tx = int(r["successful_transactions"])
            tot_amt = float(r["total_amount"])
            items.append(
                CustomerSegmentItem(
                    segment=r["segment"],
                    total_customers=cust_count,
                    total_transactions=tot_tx,
                    successful_transactions=succ_tx,
                    failed_transactions=int(r["failed_transactions"]),
                    pending_transactions=int(r["pending_transactions"]),
                    total_amount=tot_amt,
                    successful_amount=float(r["successful_amount"]),
                    avg_amount_per_customer=round(tot_amt / cust_count, 2),
                    avg_transactions_per_customer=round(tot_tx / cust_count, 2),
                    success_rate=round((succ_tx / tot_tx * 100), 2) if tot_tx > 0 else 0.0,
                )
            )
        return items

    @classmethod
    def get_overview(cls, start_date: Optional[str] = None, end_date: Optional[str] = None) -> OverviewResponse:
        kpis = cls.get_kpis()
        daily_trends = cls.get_daily_trends(start_date=start_date, end_date=end_date)
        status_dist = cls.get_status_distribution()
        type_analysis = cls.get_type_analysis()
        channel_perf = cls.get_channel_performance()
        top_branches = cls.get_top_branches(limit=10)
        
        return OverviewResponse(
            kpis=kpis,
            daily_trends=daily_trends,
            status_distribution=status_dist,
            type_analysis=type_analysis,
            channel_performance=channel_perf,
            top_branches=top_branches,
        )

