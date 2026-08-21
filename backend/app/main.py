import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.seed import seed_database
from app.routers import (
    auth_router,
    relationship_router,
    diary_router,
    milestones_router,
    meetings_router,
    plans_router,
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables & seed initial approved users on startup
    try:
        seed_database()
    except Exception as e:
        logger.error(f"Startup database initialization error: {e}")
    yield

app = FastAPI(
    title="2029 API",
    description="Private relationship journal and memory archive for Aditya & Janhvi.",
    version="1.0.0",
    lifespan=lifespan,
)

# Global Exception Handler to return JSON error details instead of generic 500
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Server Error: {str(exc)}"},
    )

# Setup CORS to allow Vercel production domains and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?://.*\.vercel\.app$|^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(relationship_router)
app.include_router(diary_router)
app.include_router(milestones_router)
app.include_router(meetings_router)
app.include_router(plans_router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "2029"}
