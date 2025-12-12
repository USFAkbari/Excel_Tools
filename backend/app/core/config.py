"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "Excel Tools API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # File Storage
    temp_files_dir: Path = Path(__file__).parent.parent.parent / "temp_files"
    max_file_size_mb: int = 50
    allowed_extensions: set[str] = {".xlsx", ".xls"}
    
    # File Cleanup
    file_retention_hours: int = 24
    
    class Config:
        env_file = [".env", "../.env"]
        case_sensitive = False


settings = Settings()

# Ensure temp directory exists
settings.temp_files_dir.mkdir(parents=True, exist_ok=True)
