"""Pydantic schemas for file merge feature."""
from pydantic import BaseModel, Field


class FileMergeRequest(BaseModel):
    """Request for merging multiple files."""
    
    file_ids: list[str] = Field(..., description="List of file IDs to merge", min_length=2)


class FileMergeResponse(BaseModel):
    """Response after file merge operation."""
    
    file_id: str = Field(..., description="New file identifier with merged data")
    files_merged: int = Field(..., description="Number of files merged")
    total_rows: int = Field(..., description="Total rows in merged file")
    message: str = Field(default="Files merged successfully")
