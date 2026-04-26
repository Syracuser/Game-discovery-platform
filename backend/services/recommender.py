# services/recommender.py
# Scores every game in the database against the user's preferences
# and returns them sorted by match probability (best match first).

from fastapi import HTTPException
from database.connection import games_collection
from ml.model import build_feature_vector, load_model, ALL_GENRES, ALL_TAGS

# Load once when the module is first imported (at server startup).
# Reused for every request — no repeated disk I/O.
# If the model file doesn't exist yet, _model is set to None and
# each request will return a clear 503 error instead of crashing.

try:
    _model = load_model()
except FileNotFoundError:
    _model = None


async def get_recommendations(user_genres: list[str], user_tags: list[str]) -> list[dict]:

    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation service unavailable — model not trained yet. Run ml/model.py first."
        )

    model = _model

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
        vector = build_feature_vector(valid_genres, valid_tags, game["genres"], game["tags"])
        probability = model.predict_proba([vector])[0][1]  # probability that liked=1

        game["_id"] = str(game["_id"])
        game["match_score"] = round(probability, 2)
        scored_games.append(game)

    # Sort highest match score first
    scored_games.sort(key=lambda g: g["match_score"], reverse=True)

    return {
        "results": scored_games,
        "warnings": {
            "unknown_genres": unknown_genres,
            "unknown_tags": unknown_tags,
        }
    }
