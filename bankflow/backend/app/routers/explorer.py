from typing import Optional
from fastapi import APIRouter, Query, Path
from app.services.explorer_service import ExplorerService
from app.schemas.explorer import TablesListResponse, TableDataResponse

router = APIRouter(prefix="/api/data-explorer", tags=["Data Explorer"])

@router.get("/tables", response_model=TablesListResponse)
def get_tables():
    return ExplorerService.get_tables_metadata()

@router.get("/{table_name}", response_model=TableDataResponse)
def get_table_data(
    table_name: str = Path(..., description="Gold table name"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term"),
    sort_by: Optional[str] = Query(None, description="Column name to sort by"),
    sort_order: str = Query("asc", pattern="^(asc|desc|ASC|DESC)$", description="Sort order"),
):
    return ExplorerService.get_table_data(
        table_name=table_name,
        page=page,
        limit=limit,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )

