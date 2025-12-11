"""FastAPI dependency injection utilities."""
from typing import Annotated
from fastapi import Depends

from app.shared.file_service import FileService


def get_file_service() -> FileService:
    """Dependency injection for FileService."""
    return FileService()


# Type alias for dependency injection
FileServiceDep = Annotated[FileService, Depends(get_file_service)]
