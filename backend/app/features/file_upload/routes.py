"""API routes for file upload feature."""
from fastapi import APIRouter, UploadFile, File

from app.core.dependencies import FileServiceDep
from app.features.file_upload.service import FileUploadService
from app.features.file_upload.schemas import UploadResponse

router = APIRouter(prefix="/api", tags=["File Upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(..., description="Excel file to upload"),
    file_service: FileServiceDep = None
):
    """
    Upload an Excel file and receive a unique file_id.
    
    This file_id should be used in all subsequent operations.
    """
    service = FileUploadService(file_service)
    return await service.upload_file(file)
