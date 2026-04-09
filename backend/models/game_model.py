from pydantic import BaseModel


class GameModel(BaseModel):
    name: str
    genres: list[str]
    tags: list[str]
    rating: float
    studio: str
    price: float
    image: str = ""  # URL to the game's cover image


"""
Game Model

Defines the structure of a game document using Pydantic.
Pydantic makes sure that any game data we receive has the right
fields and the right types (e.g., rating must be a number, not text).

FastAPI uses these models to:
- Validate incoming data automatically
- Generate clear error messages if something is wrong
- Show the expected format in the API docs
"""
