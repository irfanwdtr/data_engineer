from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class TableInfo(BaseModel):
    table_name: str
    display_name: str
    description: str
    row_count: int
    columns: List[str]

class TablesListResponse(BaseModel):
    tables: List[TableInfo]

class TableDataResponse(BaseModel):
    table_name: str
    page: int
    limit: int
    total_records: int
    total_pages: int
    columns: List[str]
    rows: List[Dict[str, Any]]
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "asc"

