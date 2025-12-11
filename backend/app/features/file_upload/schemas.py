"""Pydantic schemas for file upload feature."""
from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    """Response after successful file upload."""
    
    file_id: str = Field(..., description="Unique identifier for the uploaded file")
    filename: str = Field(..., description="Original filename")
    message: str = Field(default="File uploaded successfully")
