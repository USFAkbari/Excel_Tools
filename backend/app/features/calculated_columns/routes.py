"""Calculated columns feature."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import pandas as pd

from app.shared.file_service import FileService
from app.core.dependencies import FileServiceDep


class CalculatedColumnRequest(BaseModel):
    file_id: str
    new_column_name: str = Field(..., min_length=1)
    formula: str = Field(..., description="Python expression using column names")


class CalculatedColumnResponse(BaseModel):
    file_id: str
    new_column: str
    message: str


class CalculatedColumnsService:
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def create_calculated_column(self, request: CalculatedColumnRequest) -> CalculatedColumnResponse:
        df = self.file_service.load_excel(request.file_id)
        
        try:
            # Evaluate formula in DataFrame context
            # Note: This uses eval which can be dangerous in production
            # Consider using a safer expression parser for production use
            df[request.new_column_name] = df.eval(request.formula)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to evaluate formula: {str(e)}"
            )
        
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        
        return CalculatedColumnResponse(
            file_id=new_file_id,
            new_column=request.new_column_name,
            message="Calculated column created successfully"
        )


router = APIRouter(prefix="/api", tags=["Calculated Columns"])


@router.post("/calculated-column", response_model=CalculatedColumnResponse)
async def create_calculated_column(request: CalculatedColumnRequest, file_service: FileServiceDep = None):
    """
    Create a new column based on a formula.
    
    Formula should be a Python expression using existing column names.
    Example: "Price * Quantity" or "Column_A + Column_B"
    """
    service = CalculatedColumnsService(file_service)
    return service.create_calculated_column(request)
