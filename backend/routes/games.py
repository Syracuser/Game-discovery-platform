from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database.connection import games_collection
from models.game_model import GameModel

router = APIRouter()


@router.get("/games")
async def get_all_games():
    """Fetch every game from the database and return them as a list."""
    games = await games_collection.find().to_list()

    # MongoDB stores IDs as ObjectId objects, but JSON can't handle those,
    # so we convert each game's "_id" to a regular string
    for game in games:
        game["_id"] = str(game["_id"])
    
    return games


@router.get("/games/{game_id}")
async def get_game(game_id: str):
    # Check if the ID is a valid MongoDB ObjectId format
    if not ObjectId.is_valid(game_id):
        raise HTTPException(status_code=400, detail="Invalid game ID format")

    game = await games_collection.find_one({"_id": ObjectId(game_id)})
    
    # Check if a game exists with the ID provided
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    game["_id"] = str(game["_id"])
    return game


@router.post("/games")
async def add_game(game: GameModel):
    """Add a new game to the database."""
    result = await games_collection.insert_one(game.model_dump())

    return {"message": "Game added successfully", "id": str(result.inserted_id)}


@router.get("/genres")
async def get_all_genres():
    """Return a sorted list of every unique genre across all games."""
    genres = await games_collection.distinct("genres")
    return sorted(genres)


@router.get("/studios")
async def get_all_studios():
    """Return a sorted list of every unique studio across all games."""
    studios = await games_collection.distinct("studio")
    return sorted(studios)


"""
Game Routes

Handles all API endpoints related to games:
- GET /games — retrieve all games
- GET /games/{id} — retrieve a single game by its ID
- POST /games — add a new game to the database
- GET /genres — retrieve all unique genres
- GET /studios — retrieve all unique studios

Uses APIRouter instead of putting routes directly on the app.
This keeps our code organized — game routes live here,
and later, wishlist routes can live in their own file.
"""
