"""Shared Pydantic models used across features."""
from pydantic import BaseModel, Field
from typing import Any


class FileResponse(BaseModel):
    """Response model for file operations that return a file_id."""
    
    file_id: str = Field(..., description="Unique identifier for the file")
    message: str = Field(default="Operation successful", description="Status message")
    metadata: dict[str, Any] | None = Field(default=None, description="Additional metadata")


class ErrorResponse(BaseModel):
    """Error response model."""
    
    error: str = Field(..., description="Error message")
    detail: str | None = Field(default=None, description="Detailed error information")


class PreviewData(BaseModel):
    """Model for file preview data."""
    
    file_id: str = Field(..., description="File identifier")
    columns: list[str] = Field(..., description="Column names")
    data: list[dict[str, Any]] = Field(..., description="Row data as list of dictionaries")
    total_rows: int = Field(..., description="Total number of rows in the file")
    preview_rows: int = Field(..., description="Number of rows in this preview")
