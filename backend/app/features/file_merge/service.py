"""Service layer for file merge operations."""
import pandas as pd

from app.shared.file_service import FileService
from app.features.file_merge.schemas import FileMergeRequest, FileMergeResponse


class FileMergeService:
    """Business logic for merging multiple files."""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def merge_files(self, request: FileMergeRequest) -> FileMergeResponse:
        """
        Merge multiple Excel files into one.
        
        Args:
            request: FileMergeRequest with list of file_ids
            
        Returns:
            FileMergeResponse with new file_id
        """
        # Load all DataFrames
        dataframes = []
        for file_id in request.file_ids:
            df = self.file_service.load_excel(file_id)
            dataframes.append(df)
        
        # Concatenate all DataFrames
        merged_df = pd.concat(dataframes, ignore_index=True)
        
        # Save merged file
        new_file_id = self.file_service.save_dataframe(merged_df, request.file_ids[0])
        
        return FileMergeResponse(
            file_id=new_file_id,
            files_merged=len(request.file_ids),
            total_rows=len(merged_df),
            message="Files merged successfully"
        )
