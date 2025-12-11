"""API routes for file preview feature."""
from fastapi import APIRouter, Query

from app.core.dependencies import FileServiceDep
from app.features.file_preview.service import FilePreviewService
from app.features.file_preview.schemas import PreviewResponse

router = APIRouter(prefix="/api", tags=["File Preview"])


@router.get("/preview/{file_id}", response_model=PreviewResponse)
async def preview_file(
    file_id: str,
    file_service: FileServiceDep,
    max_rows: int = Query(default=50, ge=1, le=1000, description="Maximum rows to preview")
):
    """
    Get a preview of the Excel file data.
    
    Returns the first N rows as JSON for display in the frontend.
    """
    service = FilePreviewService(file_service)
    return service.get_preview(file_id, max_rows)
