from fastapi import APIRouter, HTTPException
import httpx
from services.browse import get_popular, get_new, get_trending, get_game_detail, search_games

"""
Browse Routes

Live RAWG passthrough endpoints for browsing the full catalog:
- GET /popular        — all-time popular games
- GET /new            — recent releases (junk-filtered)
- GET /trending       — recent games gaining traction
- GET /search?q=...   — live search across RAWG's full catalog
- GET /rawg/{rawg_id} — one game's full detail (live), for the live detail page

The list endpoints support ?page=N for the "View All" / pagination pages.

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


@router.get("/search")
async def browse_search(q: str, page: int = 1):
    """Live search across RAWG's full catalog (replaces the old DB-only search)."""
    return await _safe(search_games(q, page))


@router.get("/rawg/{rawg_id}")
async def browse_game_detail(rawg_id: int):
    """One live game's full detail (with screenshots), for the live detail page."""
    try:
        return await get_game_detail(rawg_id)
    except httpx.HTTPStatusError as e:
        # A 404 from RAWG means the game id doesn't exist — report that as 404,
        # not as a generic "service down". Other status errors are still 503.
        if e.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Game not found")
        raise HTTPException(status_code=503, detail=f"Game service error: {e}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"Could not reach the game service (RAWG): {e}")
