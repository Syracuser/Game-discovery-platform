from fastapi import APIRouter, HTTPException
from bson import ObjectId
from database.connection import games_collection
from models.game_model import GameModel

router = APIRouter()


@router.get("/games")
async def get_all_games():
    """Fetch every game from the database and return them as a list."""
    games = await games_collection.find().to_list(None)

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



"""
Game Routes

Handles all API endpoints related to games:
- GET /games — retrieve all games
- GET /games/{id} — retrieve a single game by its ID
- POST /games — add a new game to the database

Uses APIRouter instead of putting routes directly on the app.
This keeps our code organized — game routes live here,
and later, wishlist routes can live in their own file.
"""
