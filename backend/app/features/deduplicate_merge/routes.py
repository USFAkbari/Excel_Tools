"""API routes for deduplicate & merge feature."""
from fastapi import APIRouter

from app.core.dependencies import FileServiceDep
from app.features.deduplicate_merge.service import DeduplicateMergeService
from app.features.deduplicate_merge.schemas import (
    DeduplicateMergeRequest,
    DeduplicateMergeResponse
)

router = APIRouter(prefix="/api", tags=["Deduplicate & Merge"])


@router.post("/deduplicate-merge", response_model=DeduplicateMergeResponse)
async def deduplicate_and_merge(
    request: DeduplicateMergeRequest,
    file_service: FileServiceDep = None
):
    """
    Identify and merge duplicate rows.
    
    Duplicates are identified based on the specified columns.
    When merging duplicates:
    - Numeric columns are summed
    - Non-numeric columns take the first value
    
    Returns a new file_id with deduplicated data.
    """
    service = DeduplicateMergeService(file_service)
    return service.deduplicate_and_merge(request)
