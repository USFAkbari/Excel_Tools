"""Search and replace feature."""
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.shared.file_service import FileService
from app.core.dependencies import FileServiceDep


class SearchReplaceRequest(BaseModel):
    file_id: str
    columns: list[str] | None = Field(default=None, description="Columns to search (null = all)")
    search_text: str = Field(..., min_length=1)
    replace_text: str
    case_sensitive: bool = Field(default=False)


class SearchReplaceResponse(BaseModel):
    file_id: str
    replacements_made: int
    message: str


class SearchReplaceService:
    def __init__(self, file_service: FileService):
        self.file_service = file_service
    
    def search_replace(self, request: SearchReplaceRequest) -> SearchReplaceResponse:
        df = self.file_service.load_excel(request.file_id)
        
        columns = request.columns if request.columns else df.columns.tolist()
        total_replacements = 0
        
        for col in columns:
            # Convert to string and perform replacement
            original = df[col].astype(str)
            replaced = original.str.replace(
                request.search_text,
                request.replace_text,
                case=request.case_sensitive,
                regex=False
            )
            
            # Count replacements
            replacements = (original != replaced).sum()
            total_replacements += replacements
            
            df[col] = replaced
        
        new_file_id = self.file_service.save_dataframe(df, request.file_id)
        
        return SearchReplaceResponse(
            file_id=new_file_id,
            replacements_made=int(total_replacements),
            message=f"Search and replace completed ({total_replacements} replacements)"
        )


router = APIRouter(prefix="/api", tags=["Search & Replace"])


@router.post("/search-replace", response_model=SearchReplaceResponse)
async def search_replace(request: SearchReplaceRequest, file_service: FileServiceDep = None):
    """Find and replace text in specified columns."""
    service = SearchReplaceService(file_service)
    return service.search_replace(request)
