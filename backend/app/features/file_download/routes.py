"""File download endpoint."""
from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.core.dependencies import FileServiceDep

router = APIRouter(prefix="/api", tags=["File Download"])


@router.get("/download/{file_id}")
async def download_file(file_id: str, file_service: FileServiceDep):
    """
    Download an Excel file by its file_id.
    
    Returns the file as a downloadable attachment.
    """
    file_path = file_service.get_file_path(file_id)
    
    # Get the original filename with extension
    filename = f"{file_id}{file_path.suffix}"
    
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=filename
    )
