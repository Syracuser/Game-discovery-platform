# routes/recommend.py
# Exposes the POST /recommend endpoint.
# Receives the user's preferred genres and tags, returns games ranked by match score.

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.recommender import get_recommendations

router = APIRouter()

# Defines the shape of the request body the client must send
class UserPreferences(BaseModel):
    genres: list[str]
    tags: list[str]


# Processing the user's preferences through the recommend_games function and returns ranked results
@router.post("/recommend")
async def recommend_games(preferences: UserPreferences):
    try:
        results = await get_recommendations(preferences.genres, preferences.tags)
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation service failed: {str(e)}")
