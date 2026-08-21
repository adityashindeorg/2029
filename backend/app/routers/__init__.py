from app.routers.auth import router as auth_router
from app.routers.relationship import router as relationship_router
from app.routers.diary import router as diary_router
from app.routers.milestones import router as milestones_router
from app.routers.meetings import router as meetings_router
from app.routers.plans import router as plans_router

__all__ = [
    "auth_router",
    "relationship_router",
    "diary_router",
    "milestones_router",
    "meetings_router",
    "plans_router",
]
