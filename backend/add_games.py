"""
add_games.py

A one-time script to seed the database with new games.
Run it from inside the backend folder while the FastAPI server is running:

    python add_games.py

It sends a POST request for each game to the /games endpoint.
If a game with the same name already exists, it skips it to avoid duplicates.
"""

import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000"

# ── New games to add ──────────────────────────────────────────────────────────

NEW_GAMES = [
    {
        "name": "Titanfall 2",
        "studio": "Respawn Entertainment",
        "genres": ["Action", "FPS", "Multiplayer"],
        "tags": ["fast-paced", "mechs", "parkour", "shooter"],
        "rating": 9.0,
        "price": 29.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/1237970/header.jpg",
    },
    {
        "name": "ULTRAKILL",
        "studio": "Arsi \"Hakita\" Patala",
        "genres": ["Action", "FPS", "Indie"],
        "tags": ["fast-paced", "retro", "stylish", "gore"],
        "rating": 9.7,
        "price": 24.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/1229490/header.jpg",
    },
    {
        "name": "Sekiro: Shadows Die Twice",
        "studio": "FromSoftware",
        "genres": ["Action", "Soulslike"],
        "tags": ["hard", "samurai", "japan", "stealth"],
        "rating": 9.4,
        "price": 59.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/814380/header.jpg",
    },
    {
        "name": "Red Dead Redemption 2",
        "studio": "Rockstar Games",
        "genres": ["Action", "Open World", "Adventure"],
        "tags": ["western", "story-rich", "realistic", "sandbox"],
        "rating": 9.7,
        "price": 39.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg",
    },
    {
        "name": "Mortal Shell",
        "studio": "Cold Symmetry",
        "genres": ["Action", "Soulslike", "Indie"],
        "tags": ["dark", "gothic", "hard", "atmospheric"],
        "rating": 7.5,
        "price": 29.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/1110910/header.jpg",
    },
    {
        "name": "Devil May Cry 5",
        "studio": "Capcom",
        "genres": ["Action", "Hack and Slash"],
        "tags": ["stylish", "fast-paced", "demons", "combos"],
        "rating": 9.2,
        "price": 29.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/601150/header.jpg",
    },
    {
        "name": "Dead Cells",
        "studio": "Motion Twin",
        "genres": ["Action", "Roguelike", "Metroidvania"],
        "tags": ["indie", "pixel", "hard", "procedural"],
        "rating": 9.3,
        "price": 24.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/588650/header.jpg",
    },
    {
        "name": "Hollow Knight",
        "studio": "Team Cherry",
        "genres": ["Action", "Metroidvania", "Indie"],
        "tags": ["atmospheric", "exploration", "difficult", "insects"],
        "rating": 9.5,
        "price": 14.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/367520/header.jpg",
    },
    {
        "name": "Dispatch",
        "studio": "AdHoc Studio",
        "genres": ["Strategy", "Narrative", "Indie"],
        "tags": ["superheroes", "tactical", "management", "story-rich", "comedy"],
        "rating": 8.5,
        "price": 29.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/2592160/header.jpg",
    },
    {
        "name": "God of War",
        "studio": "Santa Monica Studio",
        "genres": ["Action", "Adventure"],
        "tags": ["mythology", "story-rich", "norse", "combat"],
        "rating": 9.6,
        "price": 49.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg",
    },
    {
        "name": "God of War Ragnarök",
        "studio": "Santa Monica Studio",
        "genres": ["Action", "Adventure"],
        "tags": ["mythology", "story-rich", "norse", "combat", "sequel"],
        "rating": 9.6,
        "price": 59.99,
        "image": "https://cdn.akamai.steamstatic.com/steam/apps/2322010/header.jpg",
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_existing_game_names():
    """Fetch all games currently in the DB and return a set of their names."""
    with urllib.request.urlopen(f"{BASE_URL}/games") as response:
        games = json.loads(response.read())
    return {game["name"] for game in games}


def post_game(game: dict):
    """Send a single game to the POST /games endpoint."""
    data = json.dumps(game).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/games",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("Fetching existing games...")
    existing_names = get_existing_game_names()
    print(f"Found {len(existing_names)} existing game(s).\n")

    added = 0
    skipped = 0

    for game in NEW_GAMES:
        name = game["name"]
        if name in existing_names:
            print(f"  SKIP   {name}  (already in database)")
            skipped += 1
        else:
            result = post_game(game)
            print(f"  ADDED  {name}  - id: {result.get('id')}")
            added += 1

    print(f"\nDone. Added: {added} | Skipped: {skipped}")


if __name__ == "__main__":
    main()
