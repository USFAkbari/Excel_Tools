"""Service layer for file upload operations."""
from fastapi import UploadFile

from app.shared.file_service import FileService
from app.features.file_upload.schemas import UploadResponse


class FileUploadService:
    """Business logic for file upload."""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    async def upload_file(self, file: UploadFile) -> UploadResponse:
        """
        Handle file upload and return file_id.
        
        Args:
            file: Uploaded Excel file
            
        Returns:
            UploadResponse with file_id and filename
        """
        file_id, _ = await self.file_service.save_upload(file)
        
        return UploadResponse(
            file_id=file_id,
            filename=file.filename,
            message="File uploaded successfully"
        )
