"""API routes for file merge feature."""
from fastapi import APIRouter

from app.core.dependencies import FileServiceDep
from app.features.file_merge.service import FileMergeService
from app.features.file_merge.schemas import FileMergeRequest, FileMergeResponse

router = APIRouter(prefix="/api", tags=["File Merge"])


@router.post("/merge", response_model=FileMergeResponse)
async def merge_files(
    request: FileMergeRequest,
    file_service: FileServiceDep = None
):
    """
    Merge multiple Excel files into one.
    
    All files will be concatenated vertically (rows are combined).
    Returns a new file_id for the merged file.
    """
    service = FileMergeService(file_service)
    return service.merge_files(request)
