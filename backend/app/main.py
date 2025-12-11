"""FastAPI main application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Import feature routers
from app.features.file_upload.routes import router as upload_router
from app.features.file_preview.routes import router as preview_router
from app.features.file_download.routes import router as download_router
from app.features.file_merge.routes import router as merge_router
from app.features.deduplicate_merge.routes import router as deduplicate_router
from app.features.sort_data.routes import router as sort_router
from app.features.number_normalization.routes import router as normalization_router
from app.features.data_filtering.routes import router as filtering_router
from app.features.column_management.routes import router as column_mgmt_router
from app.features.search_replace.routes import router as search_replace_router
from app.features.type_conversion.routes import router as type_conversion_router
from app.features.calculated_columns.routes import router as calculated_router
from app.features.split_data.routes import router as split_router


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A modular Excel processing API built with Feature-Sliced Design",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register all feature routers
app.include_router(upload_router)
app.include_router(preview_router)
app.include_router(download_router)
app.include_router(merge_router)
app.include_router(deduplicate_router)
app.include_router(sort_router)
app.include_router(normalization_router)
app.include_router(filtering_router)
app.include_router(column_mgmt_router)
app.include_router(search_replace_router)
app.include_router(type_conversion_router)
app.include_router(calculated_router)
app.include_router(split_router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "message": "Excel Tools API is running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
