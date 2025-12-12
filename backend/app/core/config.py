"""Application configuration using Pydantic Settings."""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from pathlib import Path


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "Excel Tools API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS
    # Must allow str to handle comma-separated strings from .env without JSON parsing error
    cors_origins: list[str] | str = ["http://localhost:3000", "http://localhost:8000"]
    
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str] | str:
        if isinstance(v, str) and not v.strip().startswith("["):
            return [i.strip() for i in v.split(",")]
        return v
    
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
