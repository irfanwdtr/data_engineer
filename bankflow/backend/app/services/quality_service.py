import json
import os
from pathlib import Path
from typing import Optional
from app.config import settings, BASE_DIR
from app.schemas.quality import (
    CheckItem,
    QualitySummary,
    DataQualityResponse,
)

def infer_dataset(check_name: str) -> str:
    name = check_name.lower()
    if "branch" in name:
        return "Branch"
    if "customer" in name:
        return "Customer"
    if "account" in name:
        return "Account"
    if "transaction" in name:
        return "Transaction"
    return "General"

def infer_category(check_name: str) -> str:
    name = check_name.lower()
    if "required_columns" in name:
        return "Schema Structure"
    if "required_fields" in name or "null" in name:
        return "Field Completeness"
    if "unique" in name:
        return "Uniqueness"
    if "valid" in name:
        return "Value Validity"
    if "reference" in name or "consistency" in name:
        return "Referential Integrity"
    return "Data Quality"

class QualityService:
    @staticmethod
    def get_quality_report() -> DataQualityResponse:
        candidate_paths = [
            Path(settings.QUALITY_REPORT_PATH),
            BASE_DIR / "data_quality" / "reports" / "quality_report.json",
            Path("/opt/bankflow/data_quality/reports/quality_report.json"),
            Path("/app/data_quality/reports/quality_report.json"),
            Path("data_quality/reports/quality_report.json"),
        ]

        report_file: Optional[Path] = None
        for p in candidate_paths:
            if p.exists() and p.is_file():
                report_file = p
                break

        if not report_file:
            return DataQualityResponse(
                has_report=False,
                overall_status="NO_REPORT",
                summary=QualitySummary(
                    total_checks=0,
                    passed=0,
                    failed=0,
                    pass_rate=0.0,
                ),
                checks=[],
            )

        try:
            with open(report_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            summary_raw = data.get("summary", {})
            total_checks = int(summary_raw.get("total_checks", 0))
            passed = int(summary_raw.get("passed", 0))
            failed = int(summary_raw.get("failed", 0))
            pass_rate = round((passed / total_checks * 100), 2) if total_checks > 0 else 0.0

            checks: list[CheckItem] = []
            for item in data.get("checks", []):
                check_name = item.get("check_name", "unknown_check")
                checks.append(
                    CheckItem(
                        check_name=check_name,
                        status=str(item.get("status", "UNKNOWN")).upper(),
                        failed_records=int(item.get("failed_records", 0)),
                        details=str(item.get("details", "")),
                        dataset=infer_dataset(check_name),
                        category=infer_category(check_name),
                    )
                )

            return DataQualityResponse(
                has_report=True,
                generated_at=data.get("generated_at"),
                overall_status=str(data.get("overall_status", "UNKNOWN")).upper(),
                summary=QualitySummary(
                    total_checks=total_checks,
                    passed=passed,
                    failed=failed,
                    pass_rate=pass_rate,
                ),
                checks=checks,
            )

        except Exception:
            return DataQualityResponse(
                has_report=False,
                overall_status="ERROR_PARSING",
                summary=QualitySummary(
                    total_checks=0,
                    passed=0,
                    failed=0,
                    pass_rate=0.0,
                ),
                checks=[],
            )

