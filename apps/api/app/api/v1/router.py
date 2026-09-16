from fastapi import APIRouter

from app.api.v1.posts import router as posts_router
from app.api.v1.spots import router as spots_router
from app.api.v1.themes import router as themes_router

api_router = APIRouter()
api_router.include_router(posts_router)
api_router.include_router(spots_router)
api_router.include_router(themes_router)
