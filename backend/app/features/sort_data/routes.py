"""API routes for sort data feature."""
from fastapi import APIRouter

from app.core.dependencies import FileServiceDep
from app.features.sort_data.service import SortDataService
from app.features.sort_data.schemas import SortDataRequest, SortDataResponse

router = APIRouter(prefix="/api", tags=["Sort Data"])


@router.post("/sort", response_model=SortDataResponse)
async def sort_data(
    request: SortDataRequest,
    file_service: FileServiceDep = None
):
    """
    Sort data by a specific column in ascending or descending order.
    
    Returns a new file_id with sorted data.
    """
    service = SortDataService(file_service)
    return service.sort_data(request)
