"""Type conversion feature."""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from enum import Enum
import pandas as pd

from app.shared.file_service import FileService
from app.core.dependencies import FileServiceDep


class DataType(str, Enum):
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATETIME = "datetime"


class TypeConversionRequest(BaseModel):
    file_id: str
    conversions: dict[str, DataType] = Field(..., description="Map of column -> target_type")


class TypeConversionResponse(BaseModel):
    file_id: str
    columns_converted: int
    message: str


class TypeConversionService:
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def convert_types(self, request: TypeConversionRequest) -> TypeConversionResponse:
        df = self.file_service.load_excel(request.file_id)
        
        for col, dtype in request.conversions.items():
            if dtype == DataType.STRING:
                df[col] = df[col].astype(str)
            elif dtype == DataType.INTEGER:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
            elif dtype == DataType.FLOAT:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            elif dtype == DataType.BOOLEAN:
                df[col] = df[col].astype(bool)
            elif dtype == DataType.DATETIME:
                df[col] = pd.to_datetime(df[col], errors='coerce')
        
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        
        return TypeConversionResponse(
            file_id=new_file_id,
            columns_converted=len(request.conversions),
            message="Type conversion completed successfully"
        )


router = APIRouter(prefix="/api", tags=["Type Conversion"])


@router.post("/convert-types", response_model=TypeConversionResponse)
async def convert_types(request: TypeConversionRequest, file_service: FileServiceDep = None):
    """Convert columns to specified data types (String, Integer, Float, Boolean, DateTime)."""
    service = TypeConversionService(file_service)
    return service.convert_types(request)
