"""Service layer for file preview operations."""
from app.shared.file_service import FileService
from app.features.file_preview.schemas import PreviewResponse


class FilePreviewService:
    """Business logic for file preview."""
    
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def get_preview(self, file_id: str, max_rows: int = 50) -> PreviewResponse:
        """
        Get preview data from an Excel file.
        
        Args:
            file_id: The file identifier
            max_rows: Maximum number of rows to return
            
        Returns:
            PreviewResponse with column names and data
        """
        # Load DataFrame
        df = self.file_service.load_excel(file_id)
        
        # Get preview data
        preview_df = df.head(max_rows)
        total_rows = len(df)
        
        # Convert to list of dictionaries
        # Handle NaN values by converting to None
        data = preview_df.fillna("").to_dict(orient="records")
        
        return PreviewResponse(
            file_id=file_id,
            columns=df.columns.tolist(),
            data=data,
            total_rows=total_rows,
            preview_rows=len(preview_df)
        )
