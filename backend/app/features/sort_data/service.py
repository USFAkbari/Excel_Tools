"""Service layer for sorting data operations."""
from fastapi import HTTPException

from app.shared.file_service import FileService
from app.features.sort_data.schemas import SortDataRequest, SortDataResponse, SortOrder


class SortDataService:
    """Business logic for sorting data."""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def sort_data(self, request: SortDataRequest) -> SortDataResponse:
        """
        Sort data by specified column.
        
        Args:
            request: SortDataRequest
            
        Returns:
            SortDataResponse with new file_id
        """
        # Load DataFrame
        df = self.file_service.load_excel(request.file_id)
        
        # Validate column exists
        if request.column not in df.columns:
            raise HTTPException(
                status_code=400,
                detail=f"Column '{request.column}' not found in file"
            )
        
        # Sort data
        ascending = request.order == SortOrder.ASCENDING
        sorted_df = df.sort_values(by=request.column, ascending=ascending)
        
        # Save to new file
        new_file_id = self.file_service.save_dataframe(sorted_df, request.file_id)
        
        return SortDataResponse(
            file_id=new_file_id,
            sorted_by=request.column,
            order=request.order.value,
            message="Data sorted successfully"
        )
