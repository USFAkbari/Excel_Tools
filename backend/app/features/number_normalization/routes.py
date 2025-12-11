"""API routes for number normalization feature."""
from fastapi import APIRouter

from app.core.dependencies import FileServiceDep
from app.features.number_normalization.service import NumberNormalizationService
from app.features.number_normalization.schemas import (
    NumberNormalizationRequest,
    NumberNormalizationResponse
)

router = APIRouter(prefix="/api", tags=["Number Normalization"])


@router.post("/normalize-numbers", response_model=NumberNormalizationResponse)
async def normalize_numbers(
    request: NumberNormalizationRequest,
    file_service: FileServiceDep = None
):
    """
    Convert Persian digits (۰-۹) to English (0-9) or vice versa.
    
    Useful for standardizing number formats across different locales.
    Returns a new file_id with normalized data.
    """
    service = NumberNormalizationService(file_service)
    return service.normalize_numbers(request)
