"""
services/browse.py

Live RAWG passthrough for the browse experience (home sections + pagination).

Unlike import_rawg.py (a one-off script that SAVES games to the DB), this runs
inside the live server: it calls RAWG in real time and returns games for display
WITHOUT storing them. The user browses the full RAWG catalog this way.

Key points:
- Uses httpx (async) instead of urllib, so RAWG calls don't block the server.
- Reuses map_rawg_game() so live games look identical to stored games — the same
  GameCard renders both.
- Only needs ONE list call per page (the list endpoint already has the card fields,
  except studio — see SCALING_PLAN.md "studio on browse cards").
"""

import os
import httpx
from dotenv import load_dotenv
from import_rawg import map_rawg_game

load_dotenv()
RAWG_API_KEY = os.getenv("RAWG_API_KEY")
RAWG_BASE = "https://api.rawg.io/api/games"

# How many cards each section / page shows.
PAGE_SIZE = 12


async def _fetch_rawg_list(params: dict) -> dict:
    """
    Make one live call to RAWG's games-list endpoint with the given query params,
    map each result to our game shape, and return it along with paging info.

    Returns a dict: {"results": [...mapped games...], "total": <int>, "has_next": bool}
    """
    # Always include the API key and a consistent page size.
    params = {"key": RAWG_API_KEY, "page_size": PAGE_SIZE, **params}

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(RAWG_BASE, params=params)
        response.raise_for_status()
        data = response.json()

    # Shape each RAWG game like our stored games (reusing the import mapper).
    games = [map_rawg_game(raw) for raw in data.get("results", [])]

    return {
        "results": games,
        "total": data.get("count", 0),
        # RAWG returns a "next" URL when more pages exist; None means we're at the end.
        "has_next": data.get("next") is not None,
    }


async def _recent_date_range(days: int) -> str:
    """Build a RAWG 'dates' value covering the last `days` days, e.g. '2026-03-14,2026-06-12'."""
    from datetime import date, timedelta
    today = date.today()
    start = today - timedelta(days=days)
    return f"{start.isoformat()},{today.isoformat()}"


async def get_popular(page: int = 1) -> dict:
    """All-time popular games — sorted by how many users have added them."""
    return await _fetch_rawg_list({"ordering": "-added", "page": page})


async def get_new(page: int = 1) -> dict:
    """
    Recent releases, without the junk. RAWG has no working "minimum popularity"
    filter, so instead we take games from the last ~6 months and sort by how many
    users added them (-added). Shovelware nobody adds sinks to the bottom, leaving
    real, recognizable recent games. (NOTE: not pure chronological order — it's
    "recent + has traction", which is what users actually want. See SCALING_PLAN.md.)
    """
    return await _fetch_rawg_list({
        "dates": await _recent_date_range(180),  # last ~6 months
        "ordering": "-added",
        "page": page,
    })


async def get_trending(page: int = 1) -> dict:
    """
    Trending = recent games gaining traction. Same idea as get_new but a TIGHTER
    window (last ~3 months) so it surfaces what's hot right now, not just this year.
    """
    return await _fetch_rawg_list({
        "dates": await _recent_date_range(90),  # last ~3 months
        "ordering": "-added",
        "page": page,
    })


async def search_games(query: str, page: int = 1) -> dict:
    """
    Live search across RAWG's full catalog using its `search` parameter.

    This replaces the old "fetch all stored games and filter client-side" approach,
    which only searched our ~70 DB games. Now a search for any real game (e.g.
    "Dead Space") hits RAWG's entire library. Results are mapped to our game shape
    and paginated, just like the browse sections.
    """
    return await _fetch_rawg_list({"search": query, "page": page})


async def get_game_detail(rawg_id: int) -> dict:
    """
    Fetch ONE game's full detail live from RAWG, mapped to our game shape, with
    screenshots populated. Used by the live detail page (/games/rawg/:rawgId).

    This makes TWO RAWG calls because screenshots live on a separate endpoint:
      1. /games/{id}            — the full game detail (description, developers, etc.)
      2. /games/{id}/screenshots — the screenshot image URLs

    Unlike the browse list (1 call, summary only), a detail PAGE is a single game
    viewed on demand, so two calls here is fine.
    """
    detail_url = f"{RAWG_BASE}/{rawg_id}"
    shots_url = f"{RAWG_BASE}/{rawg_id}/screenshots"
    params = {"key": RAWG_API_KEY}

    async with httpx.AsyncClient(timeout=10) as client:
        # Call 1: the full game detail.
        detail_resp = await client.get(detail_url, params=params)
        detail_resp.raise_for_status()
        raw = detail_resp.json()

        # Call 2: screenshots. If this fails we still return the game — screenshots
        # are a nice-to-have, not worth failing the whole page over.
        try:
            shots_resp = await client.get(shots_url, params=params)
            shots_resp.raise_for_status()
            screenshots = [s["image"] for s in shots_resp.json().get("results", [])]
        except httpx.HTTPError:
            screenshots = []

    # Shape the game like our stored games, then attach the screenshots we fetched
    # (map_rawg_game sets screenshots to [] by design, so we fill them in here).
    game = map_rawg_game(raw)
    game["screenshots"] = screenshots
    return game
