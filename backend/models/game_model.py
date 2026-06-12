from pydantic import BaseModel


class GameModel(BaseModel):
    name: str
    genres: list[str]
    tags: list[str]
    rating: float
    studio: str
    image: str = ""
    description: str = ""
    screenshots: list[str] = []
    platforms: list[str] = []
    publisher: str = ""
    release_date: str = ""
    system_requirements: dict = {}
    # RAWG's unique game id, stored so we can detect duplicates on re-import.
    # Optional (defaults to None) — hand-added games that don't come from RAWG
    # simply leave this empty, so existing games stay valid.
    rawg_id: int | None = None


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
