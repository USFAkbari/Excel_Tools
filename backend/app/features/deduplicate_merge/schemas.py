"""Pydantic schemas for deduplicate & merge feature."""
from pydantic import BaseModel, Field


class DeduplicateMergeRequest(BaseModel):
    """Request for deduplicating and merging rows."""
    
    file_id: str = Field(..., description="File identifier")
    duplicate_columns: list[str] = Field(
        ...,
        description="Columns to use for identifying duplicates",
        min_length=1
    )


class DeduplicateMergeResponse(BaseModel):
    """Response after deduplicate & merge operation."""
    
    file_id: str = Field(..., description="New file identifier with deduplicated data")
    original_rows: int = Field(..., description="Number of rows in original file")
    deduplicated_rows: int = Field(..., description="Number of rows after deduplication")
    duplicates_removed: int = Field(..., description="Number of duplicate rows removed")
    message: str = Field(default="Deduplication completed successfully")
