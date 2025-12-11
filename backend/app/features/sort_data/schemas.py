"""Pydantic schemas for sort data feature."""
from pydantic import BaseModel, Field
from enum import Enum


class SortOrder(str, Enum):
    """Sort order direction."""
    ASCENDING = "asc"
    DESCENDING = "desc"


class SortDataRequest(BaseModel):
    """Request for sorting data."""
    
    file_id: str = Field(..., description="File identifier")
    column: str = Field(..., description="Column name to sort by")
    order: SortOrder = Field(default=SortOrder.ASCENDING, description="Sort order")


class SortDataResponse(BaseModel):
    """Response after sort operation."""
    
    file_id: str = Field(..., description="New file identifier with sorted data")
    sorted_by: str = Field(..., description="Column used for sorting")
    order: str = Field(..., description="Sort order applied")
    message: str = Field(default="Data sorted successfully")
