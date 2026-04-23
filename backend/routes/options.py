from fastapi import APIRouter
from database.connection import games_collection

router = APIRouter()


@router.get("/genres")
async def get_all_genres():
    """Return a sorted list of every unique genre across all games."""
    genres = await games_collection.distinct("genres")
    return sorted(genres)


@router.get("/tags")
async def get_all_tags():
    """Return a sorted list of every unique tag across all games."""
    tags = await games_collection.distinct("tags")
    return sorted(tags)


@router.get("/studios")
async def get_all_studios():
    """Return a sorted list of every unique studio across all games."""
    studios = await games_collection.distinct("studio")
    return sorted(studios)


"""
Options Routes

Returns the available values users can filter or search by:
- GET /genres  — all unique genres in the database
- GET /tags    — all unique tags in the database
- GET /studios — all unique studios in the database

These endpoints act as a single source of truth for any feature
that needs to know what options currently exist (filters, recommendations, etc.)
"""
