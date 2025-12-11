"""Data filtering feature."""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from enum import Enum

from app.shared.file_service import FileService
from app.core.dependencies import FileServiceDep


class FilterOperator(str, Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    GREATER_EQUAL = "greater_equal"
    LESS_EQUAL = "less_equal"


class FilterCondition(BaseModel):
    column: str
    operator: FilterOperator
    value: str | int | float


class DataFilteringRequest(BaseModel):
    file_id: str
    conditions: list[FilterCondition] = Field(..., min_length=1)
    match_all: bool = Field(default=True, description="True=AND, False=OR")


class DataFilteringResponse(BaseModel):
    file_id: str
    original_rows: int
    filtered_rows: int
    message: str


class DataFilteringService:
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def filter_data(self, request: DataFilteringRequest) -> DataFilteringResponse:
        df = self.file_service.load_excel(request.file_id)
        original_rows = len(df)
        
        # Build filter mask
        masks = []
        for condition in request.conditions:
            col = condition.column
            op = condition.operator
            val = condition.value
            
            if op == FilterOperator.EQUALS:
                mask = df[col] == val
            elif op == FilterOperator.NOT_EQUALS:
                mask = df[col] != val
            elif op == FilterOperator.CONTAINS:
                mask = df[col].astype(str).str.contains(str(val), na=False)
            elif op == FilterOperator.NOT_CONTAINS:
                mask = ~df[col].astype(str).str.contains(str(val), na=False)
            elif op == FilterOperator.GREATER_THAN:
                mask = df[col] > val
            elif op == FilterOperator.LESS_THAN:
                mask = df[col] < val
            elif op == FilterOperator.GREATER_EQUAL:
                mask = df[col] >= val
            elif op == FilterOperator.LESS_EQUAL:
                mask = df[col] <= val
            
            masks.append(mask)
        
        # Combine masks
        if request.match_all:
            final_mask = masks[0]
            for mask in masks[1:]:
                final_mask &= mask
        else:
            final_mask = masks[0]
            for mask in masks[1:]:
                final_mask |= mask
        
        filtered_df = df[final_mask]
        new_file_id = self.file_service.save_dataframe(filtered_df, request.file_id)
        
        return DataFilteringResponse(
            file_id=new_file_id,
            original_rows=original_rows,
            filtered_rows=len(filtered_df),
            message="Data filtered successfully"
        )


router = APIRouter(prefix="/api", tags=["Data Filtering"])


@router.post("/filter", response_model=DataFilteringResponse)
async def filter_data(request: DataFilteringRequest, file_service: FileServiceDep = None):
    """Filter rows based on conditions (equals, contains, >, <, etc.)."""
    service = DataFilteringService(file_service)
    return service.filter_data(request)
