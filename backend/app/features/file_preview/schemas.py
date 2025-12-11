"""Pydantic schemas for file preview feature."""
from pydantic import BaseModel, Field
from typing import Any


class PreviewResponse(BaseModel):
    """Response for file preview."""
    
    file_id: str = Field(..., description="File identifier")
    columns: list[str] = Field(..., description="Column names")
    data: list[dict[str, Any]] = Field(..., description="Preview data rows")
    total_rows: int = Field(..., description="Total rows in file")
    preview_rows: int = Field(..., description="Number of rows in preview")
