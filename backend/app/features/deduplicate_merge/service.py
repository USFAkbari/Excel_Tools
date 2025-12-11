"""Service layer for deduplicate & merge operations."""
import pandas as pd
import numpy as np
from fastapi import HTTPException

from app.shared.file_service import FileService
from app.features.deduplicate_merge.schemas import (
    DeduplicateMergeRequest,
    DeduplicateMergeResponse
)


class DeduplicateMergeService:
    """Business logic for deduplicating and merging rows."""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def deduplicate_and_merge(self, request: DeduplicateMergeRequest) -> DeduplicateMergeResponse:
        """
        Deduplicate rows based on selected columns and sum numeric values.
        
        For duplicate rows:
        - Numeric columns are summed
        - Non-numeric columns take the first value
        
        Args:
            request: DeduplicateMergeRequest with file_id and duplicate_columns
            
        Returns:
            DeduplicateMergeResponse with new file_id and statistics
        """
        # Load DataFrame
        df = self.file_service.load_excel(request.file_id)
        original_rows = len(df)
        
        # Validate columns exist
        missing_cols = set(request.duplicate_columns) - set(df.columns)
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Columns not found in file: {missing_cols}"
            )
        
        # Identify numeric and non-numeric columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        non_numeric_cols = [col for col in df.columns if col not in numeric_cols]
        
        # Remove duplicate columns from numeric list (they should be keys)
        numeric_cols_to_sum = [
            col for col in numeric_cols 
            if col not in request.duplicate_columns
        ]
        
        # Build aggregation dictionary
        agg_dict = {}
        
        # For numeric columns (excluding duplicate keys), sum them
        for col in numeric_cols_to_sum:
            agg_dict[col] = 'sum'
        
        # For non-numeric columns (excluding duplicate keys), take first
        for col in non_numeric_cols:
            if col not in request.duplicate_columns:
                agg_dict[col] = 'first'
        
        # Group by duplicate columns and aggregate
        if agg_dict:
            deduplicated_df = df.groupby(
                request.duplicate_columns,
                as_index=False,
                dropna=False
            ).agg(agg_dict)
        else:
            # If no columns to aggregate, just drop duplicates
            deduplicated_df = df.drop_duplicates(
                subset=request.duplicate_columns,
                keep='first'
            )
        
        deduplicated_rows = len(deduplicated_df)
        duplicates_removed = original_rows - deduplicated_rows
        
        # Save to new file
        new_file_id = self.file_service.save_dataframe(
            deduplicated_df,
            request.file_id
        )
        
        return DeduplicateMergeResponse(
            file_id=new_file_id,
            original_rows=original_rows,
            deduplicated_rows=deduplicated_rows,
            duplicates_removed=duplicates_removed,
            message="Deduplication completed successfully"
        )
