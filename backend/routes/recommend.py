# routes/recommend.py
# Exposes the POST /recommend endpoint.
# Receives the user's preferred genres and tags, returns games ranked by match score.
# Recommendations come from a LIVE RAWG candidate pool (not just our stored DB games).

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.recommender import get_live_recommendations

router = APIRouter()

# Defines the shape of the request body the client must send
class UserPreferences(BaseModel):
    genres: list[str]
    tags: list[str]


# Processing the user's preferences through the recommender and returning ranked results
@router.post("/recommend")
async def recommend_games(preferences: UserPreferences):
    try:
        results = await get_live_recommendations(preferences.genres, preferences.tags)
        return results

    except HTTPException:
        # Deliberate errors (e.g. 400 unrecognized prefs, 503 model not ready)
        # should pass through unchanged, not be re-wrapped as a generic 500.
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation service failed: {str(e)}")
