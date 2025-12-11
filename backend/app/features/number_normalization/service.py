"""Service layer for number normalization operations."""
import pandas as pd
from fastapi import HTTPException

from app.shared.file_service import FileService
from app.features.number_normalization.schemas import (
    NumberNormalizationRequest,
    NumberNormalizationResponse,
    NormalizationDirection
)


class NumberNormalizationService:
    """Business logic for converting Persian/English numbers."""
    
    # Persian to English digit mapping
    PERSIAN_TO_ENGLISH_MAP = str.maketrans('۰۱۲۳۴۵۶۷۸۹', '0123456789')
    ENGLISH_TO_PERSIAN_MAP = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def normalize_numbers(self, request: NumberNormalizationRequest) -> NumberNormalizationResponse:
        """
        Convert Persian digits to English or vice versa.
        
        Args:
            request: NumberNormalizationRequest
            
        Returns:
            NumberNormalizationResponse with new file_id
        """
        # Load DataFrame
        df = self.file_service.load_excel(request.file_id)
        
        # Determine columns to process
        if request.columns:
            missing_cols = set(request.columns) - set(df.columns)
            if missing_cols:
                raise HTTPException(
                    status_code=400,
                    detail=f"Columns not found: {missing_cols}"
                )
            columns_to_process = request.columns
        else:
            columns_to_process = df.columns.tolist()
        
        # Select translation map
        if request.direction == NormalizationDirection.PERSIAN_TO_ENGLISH:
            trans_map = self.PERSIAN_TO_ENGLISH_MAP
        else:
            trans_map = self.ENGLISH_TO_PERSIAN_MAP
        
        # Apply normalization
        for col in columns_to_process:
            df[col] = df[col].astype(str).apply(lambda x: x.translate(trans_map))
        
        # Save to new file
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        
        return NumberNormalizationResponse(
            file_id=new_file_id,
            columns_processed=len(columns_to_process),
            message="Number normalization completed successfully"
        )
