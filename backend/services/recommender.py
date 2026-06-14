# services/recommender.py
# Scores games against the user's preferences and returns them ranked by match
# probability (best match first).
#
# Two flavors:
#  - get_recommendations:      scores our STORED DB games (legacy / dev).
#  - get_live_recommendations: fetches a candidate pool from RAWG (by the user's
#                              genres), scores it with the model, returns the top N.
#    This is what the live app uses — recommendations across RAWG, not just our DB.

import httpx
from fastapi import HTTPException
from database.connection import games_collection
from ml.model import build_feature_vector, load_model

# Map the genre DISPLAY names the user picks (e.g. "RPG") to RAWG's filter slugs
# (e.g. "role-playing-games-rpg"). Most are just the lowercased name, but a few
# differ, so we keep an explicit map (single source of truth).
GENRE_NAME_TO_SLUG = {
    "Action": "action",
    "Indie": "indie",
    "Adventure": "adventure",
    "RPG": "role-playing-games-rpg",
    "Strategy": "strategy",
    "Shooter": "shooter",
    "Casual": "casual",
    "Simulation": "simulation",
    "Puzzle": "puzzle",
    "Arcade": "arcade",
    "Platformer": "platformer",
    "Massively Multiplayer": "massively-multiplayer",
    "Racing": "racing",
    "Sports": "sports",
    "Fighting": "fighting",
    "Family": "family",
    "Board Games": "board-games",
    "Card": "card",
    "Educational": "educational",
}

# Load once when the module is first imported (at server startup).
# Reused for every request — no repeated disk I/O.
# The vocabulary (ALL_GENRES / ALL_TAGS) is loaded straight from the saved
# model file — it travels bundled with the model, so the server never needs
# to query the database just to know which genres/tags exist.
# If the model file doesn't exist yet, model is set to None and
# each request will return a clear 503 error instead of crashing.

try:
    model, ALL_GENRES, ALL_TAGS = load_model()
except FileNotFoundError:
    model = None
    ALL_GENRES, ALL_TAGS = [], []


async def get_recommendations(user_genres: list[str], user_tags: list[str]) -> list[dict]:

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation service unavailable — model not trained yet. Run ml/model.py first."
        )

    # Filter out any genres or tags the model doesn't know about.
    # This can happen if new games were added to the database but not to ALL_GENRES/ALL_TAGS
    # in ml/model.py weren't updated and the model wasn't retrained.
    valid_genres = [g for g in user_genres if g in ALL_GENRES]
    valid_tags   = [t for t in user_tags   if t in ALL_TAGS]

    unknown_genres = [g for g in user_genres if g not in ALL_GENRES]
    unknown_tags   = [t for t in user_tags   if t not in ALL_TAGS]

    # If every preference the user sent is unrecognized, we can't score anything meaningfully.
    if not valid_genres and not valid_tags:
        raise HTTPException(
            status_code=400,
            detail="None of the submitted genres or tags are recognized by the model."
        )

    # Fetch all games from the database
    games = await games_collection.find().to_list(None)

    scored_games = []
    
    for game in games:
        # Build a feature vector for this user + game pair, then get the match probability
        vector = build_feature_vector(valid_genres, valid_tags, game["genres"], game["tags"], ALL_GENRES, ALL_TAGS)
        probability = model.predict_proba([vector])[0][1]  # probability that liked=1

        game["_id"] = str(game["_id"])
        game["match_score"] = round(probability, 2)
        scored_games.append(game)

    # Sort by match score first; use rating as tiebreaker for equal scores
    scored_games.sort(key=lambda g: (g["match_score"], g["rating"]), reverse=True)

    return {
        "results": scored_games,
        "warnings": {
            "unknown_genres": unknown_genres,
            "unknown_tags": unknown_tags,
        }
    }


# ── Live recommendations (RAWG candidate pool + model ranking) ─────────────────

import os
from dotenv import load_dotenv
from import_rawg import map_rawg_game

load_dotenv()
_RAWG_API_KEY = os.getenv("RAWG_API_KEY")
_RAWG_GAMES = "https://api.rawg.io/api/games"

# How many candidates to pull and how many to return.
_CANDIDATE_PAGE_SIZE = 40   # games per RAWG page we pull as candidates
_CANDIDATE_PAGES = 2        # pull 2 pages -> ~80 candidate games
_RESULTS_LIMIT = 15         # how many ranked games to return


async def _fetch_candidate_pool(user_genres: list[str]) -> list[dict]:
    """
    Build the pool of RAWG games the model will rank.

    We fetch by GENRE (RAWG's reliable filter). If the user picked genres, we ask
    RAWG for popular games in those genres. If they picked NO genres (only tags),
    we fall back to a general popular pool — the model then ranks it by tags.

    Returns a list of mapped game dicts (our shape), de-duplicated by rawg_id.
    """
    # Translate the user's genre display-names to RAWG slugs (skip any we don't know).
    slugs = [GENRE_NAME_TO_SLUG[g] for g in user_genres if g in GENRE_NAME_TO_SLUG]

    params = {"key": _RAWG_API_KEY, "page_size": _CANDIDATE_PAGE_SIZE, "ordering": "-added"}
    if slugs:
        # Comma-joined slugs = "games in ANY of these genres".
        params["genres"] = ",".join(slugs)
    # If no slugs, we omit the genres filter -> popular games (the fallback).

    pool = {}  # rawg_id -> mapped game, so duplicates across pages collapse
    async with httpx.AsyncClient(timeout=10) as client:
        for page in range(1, _CANDIDATE_PAGES + 1):
            resp = await client.get(_RAWG_GAMES, params={**params, "page": page})
            resp.raise_for_status()
            for raw in resp.json().get("results", []):
                game = map_rawg_game(raw)
                pool[game["rawg_id"]] = game

    return list(pool.values())


async def get_live_recommendations(user_genres: list[str], user_tags: list[str]) -> dict:
    """
    Recommend games from RAWG (not just our DB):
      1. Fetch a candidate pool from RAWG by the user's genres (or popular as fallback).
      2. Score each candidate with the model against the user's genres + tags.
      3. Return the top _RESULTS_LIMIT by match score.
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation service unavailable — model not trained yet."
        )

    # Keep only preferences the model actually knows (same guard as the DB version).
    valid_genres = [g for g in user_genres if g in ALL_GENRES]
    valid_tags   = [t for t in user_tags   if t in ALL_TAGS]
    unknown_genres = [g for g in user_genres if g not in ALL_GENRES]
    unknown_tags   = [t for t in user_tags   if t not in ALL_TAGS]

    if not valid_genres and not valid_tags:
        raise HTTPException(
            status_code=400,
            detail="None of the submitted genres or tags are recognized by the model."
        )

    # 1. Candidate pool from RAWG (uses the ORIGINAL user_genres for fetching, so we
    #    can still pull a pool even if a genre isn't in the model's vocabulary).
    candidates = await _fetch_candidate_pool(user_genres)

    # 2. Score each candidate with the model.
    scored = []
    for game in candidates:
        vector = build_feature_vector(valid_genres, valid_tags, game["genres"], game["tags"], ALL_GENRES, ALL_TAGS)
        probability = model.predict_proba([vector])[0][1]
        game["match_score"] = round(probability, 2)
        scored.append(game)

    # 3. Sort by score (rating as tiebreaker) and keep the top N.
    scored.sort(key=lambda g: (g["match_score"], g["rating"]), reverse=True)

    return {
        "results": scored[:_RESULTS_LIMIT],
        "warnings": {
            "unknown_genres": unknown_genres,
            "unknown_tags": unknown_tags,
        },
    }
