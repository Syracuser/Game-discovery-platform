from fastapi import APIRouter, HTTPException
import httpx
from services.browse import get_popular, get_new, get_trending

"""
Browse Routes

Live RAWG passthrough endpoints for browsing the full catalog:
- GET /popular  — all-time popular games
- GET /new      — recent releases (junk-filtered)
- GET /trending — recent games gaining traction

Each supports ?page=N for the "View All" / pagination pages.

These return games WITHOUT storing them — they're shaped (via map_rawg_game) to
look identical to our stored games, so the same frontend GameCard renders them.
"""

router = APIRouter()


# A small wrapper so all three endpoints handle RAWG errors the same way:
# if RAWG is down or rate-limited, return a clean 503 instead of a raw crash.
async def _safe(fetch_coro):
    try:
        return await fetch_coro
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach the game service (RAWG): {e}",
        )


@router.get("/popular")
async def browse_popular(page: int = 1):
    return await _safe(get_popular(page))


@router.get("/new")
async def browse_new(page: int = 1):
    return await _safe(get_new(page))


@router.get("/trending")
async def browse_trending(page: int = 1):
    return await _safe(get_trending(page))
