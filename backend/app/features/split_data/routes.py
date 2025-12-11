"""Split data feature."""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from enum import Enum

from app.shared.file_service import FileService
from app.core.dependencies import FileServiceDep


class SplitMethod(str, Enum):
    BY_COLUMN = "by_column"
    BY_ROW_COUNT = "by_row_count"


class SplitDataRequest(BaseModel):
    file_id: str
    method: SplitMethod
    column: str | None = Field(default=None, description="Column for BY_COLUMN method")
    row_count: int | None = Field(default=None, ge=1, description="Rows per file for BY_ROW_COUNT")


class SplitDataResponse(BaseModel):
    file_ids: list[str] = Field(..., description="List of new file IDs")
    files_created: int
    message: str


class SplitDataService:
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def split_data(self, request: SplitDataRequest) -> SplitDataResponse:
        df = self.file_service.load_excel(request.file_id)
        file_ids = []
        
        if request.method == SplitMethod.BY_COLUMN:
            # Split by unique values in column
            if not request.column:
                raise ValueError("Column is required for BY_COLUMN method")
            
            for value, group_df in df.groupby(request.column):
                new_file_id = self.file_service.save_dataframe(group_df, request.file_id)
                file_ids.append(new_file_id)
        
        elif request.method == SplitMethod.BY_ROW_COUNT:
            # Split by row count
            if not request.row_count:
                raise ValueError("Row count is required for BY_ROW_COUNT method")
            
            num_chunks = len(df) // request.row_count + (1 if len(df) % request.row_count else 0)
            
            for i in range(num_chunks):
                start_idx = i * request.row_count
                end_idx = min((i + 1) * request.row_count, len(df))
                chunk_df = df.iloc[start_idx:end_idx]
                
                new_file_id = self.file_service.save_dataframe(chunk_df, request.file_id)
                file_ids.append(new_file_id)
        
        return SplitDataResponse(
            file_ids=file_ids,
            files_created=len(file_ids),
            message=f"Data split into {len(file_ids)} files"
        )


router = APIRouter(prefix="/api", tags=["Split Data"])


@router.post("/split", response_model=SplitDataResponse)
async def split_data(request: SplitDataRequest, file_service: FileServiceDep = None):
    """
    Split one file into multiple files.
    
    Methods:
    - BY_COLUMN: Split based on unique values in a column
    - BY_ROW_COUNT: Split into files with specified number of rows
    """
    service = SplitDataService(file_service)
    return service.split_data(request)
