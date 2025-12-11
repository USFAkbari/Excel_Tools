"""Column management feature - schemas, service, and routes combined for efficiency."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Annotated
from fastapi import Depends

from app.shared.file_service import FileService
from app.core.dependencies import FileServiceDep


# Schemas
class RenameColumnsRequest(BaseModel):
    file_id: str
    rename_map: dict[str, str] = Field(..., description="Map of old_name -> new_name")


class DeleteColumnsRequest(BaseModel):
    file_id: str
    columns: list[str] = Field(..., description="Columns to delete", min_length=1)


class ReorderColumnsRequest(BaseModel):
    file_id: str
    column_order: list[str] = Field(..., description="New column order", min_length=1)


class ColumnManagementResponse(BaseModel):
    file_id: str
    message: str


# Service
class ColumnManagementService:
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def rename_columns(self, request: RenameColumnsRequest) -> ColumnManagementResponse:
        df = self.file_service.load_excel(request.file_id)
        df = df.rename(columns=request.rename_map)
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        return ColumnManagementResponse(file_id=new_file_id, message="Columns renamed successfully")
    
    def delete_columns(self, request: DeleteColumnsRequest) -> ColumnManagementResponse:
        df = self.file_service.load_excel(request.file_id)
        df = df.drop(columns=request.columns, errors='raise')
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        return ColumnManagementResponse(file_id=new_file_id, message="Columns deleted successfully")
    
    def reorder_columns(self, request: ReorderColumnsRequest) -> ColumnManagementResponse:
        df = self.file_service.load_excel(request.file_id)
        df = df[request.column_order]
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        return ColumnManagementResponse(file_id=new_file_id, message="Columns reordered successfully")


# Routes
router = APIRouter(prefix="/api/columns", tags=["Column Management"])


@router.post("/rename", response_model=ColumnManagementResponse)
async def rename_columns(request: RenameColumnsRequest, file_service: FileServiceDep = None):
    """Rename columns using a mapping dictionary."""
    service = ColumnManagementService(file_service)
    return service.rename_columns(request)


@router.post("/delete", response_model=ColumnManagementResponse)
async def delete_columns(request: DeleteColumnsRequest, file_service: FileServiceDep = None):
    """Delete specified columns."""
    service = ColumnManagementService(file_service)
    return service.delete_columns(request)


@router.post("/reorder", response_model=ColumnManagementResponse)
async def reorder_columns(request: ReorderColumnsRequest, file_service: FileServiceDep = None):
    """Reorder columns to specified order."""
    service = ColumnManagementService(file_service)
    return service.reorder_columns(request)
