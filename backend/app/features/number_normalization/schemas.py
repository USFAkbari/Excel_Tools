"""Pydantic schemas for number normalization feature."""
from pydantic import BaseModel, Field
from enum import Enum


class NormalizationDirection(str, Enum):
    """Direction of number normalization."""
    PERSIAN_TO_ENGLISH = "persian_to_english"
    ENGLISH_TO_PERSIAN = "english_to_persian"


class NumberNormalizationRequest(BaseModel):
    """Request for number normalization."""
    
    file_id: str = Field(..., description="File identifier")
    columns: list[str] | None = Field(
        default=None,
        description="Columns to normalize (null = all columns)"
    )
    direction: NormalizationDirection = Field(
        ...,
        description="Direction of normalization"
    )


class NumberNormalizationResponse(BaseModel):
    """Response after number normalization."""
    
    file_id: str = Field(..., description="New file identifier")
    columns_processed: int = Field(..., description="Number of columns processed")
    message: str = Field(default="Number normalization completed successfully")
