from fastapi import APIRouter

from app.api.v1.posts import router as posts_router

api_router = APIRouter()
api_router.include_router(posts_router)
