"""
add_games.py

A database seeding script — adds games to the database via the /games endpoint.
Safe to run multiple times: already-existing games are skipped automatically.

Run it from inside the backend folder while the FastAPI server is running:

    python add_games.py

Useful for fresh project setup or adding new games to the list.
"""

import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000"

# ── New games to add ──────────────────────────────────────────────────────────

_STEAM = "https://cdn.akamai.steamstatic.com/steam/apps"

NEW_GAMES = [
    {
        "name": "Titanfall 2",
        "studio": "Respawn Entertainment",
        "publisher": "EA Games",
        "release_date": "October 28, 2016",
        "genres": ["Action", "FPS", "Multiplayer"],
        "tags": ["fast-paced", "mechs", "parkour", "shooter"],
        "rating": 9.0,
        "price": 29.99,
        "image": f"{_STEAM}/1237970/header.jpg",
        "screenshots": [
            f"{_STEAM}/1237970/header.jpg",
            f"{_STEAM}/1237970/capsule_616x353.jpg",
        ],
        "description": (
            "A single-player campaign that builds an unlikely bond between pilot and Titan, "
            "backed by one of the most fluid and creative multiplayer modes ever put into a shooter. "
            "Wall-run across rooftops, chain jumps through the air, and call down your Titan when the time is right."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 7/8/10 64-bit",
                "Processor": "Intel Core i3-6300T / AMD FX-4350",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GTX 660 2GB / AMD Radeon HD 7850 2GB",
                "DirectX": "Version 11",
                "Storage": "45 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5-6600K / AMD Ryzen 5 1600X",
                "Memory": "16 GB RAM",
                "Graphics": "NVIDIA GTX 1060 6GB / AMD RX 480 8GB",
                "DirectX": "Version 11",
                "Storage": "45 GB available space",
            },
        },
    },
    {
        "name": "ULTRAKILL",
        "studio": "Arsi \"Hakita\" Patala",
        "publisher": "New Blood Interactive",
        "release_date": "September 3, 2020",
        "genres": ["Action", "FPS", "Indie"],
        "tags": ["fast-paced", "retro", "stylish", "gore"],
        "rating": 9.7,
        "price": 24.99,
        "image": f"{_STEAM}/1229490/header.jpg",
        "screenshots": [
            f"{_STEAM}/1229490/header.jpg",
            f"{_STEAM}/1229490/capsule_616x353.jpg",
        ],
        "description": (
            "A fast-paced retro first-person shooter where you are a machine that runs on blood. "
            "Dash through hellish arenas, tear enemies apart at close range to restore health, "
            "and rack up style points with increasingly creative kills."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i3 / AMD equivalent",
                "Memory": "4 GB RAM",
                "Graphics": "NVIDIA GTX 1050 / AMD RX 560",
                "DirectX": "Version 11",
                "Storage": "3 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5 / AMD Ryzen 5",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GTX 1070 / AMD RX 580",
                "DirectX": "Version 11",
                "Storage": "3 GB available space",
            },
        },
    },
    {
        "name": "Sekiro: Shadows Die Twice",
        "studio": "FromSoftware",
        "publisher": "Activision",
        "release_date": "March 22, 2019",
        "genres": ["Action", "Soulslike"],
        "tags": ["hard", "samurai", "japan", "stealth"],
        "rating": 9.4,
        "price": 59.99,
        "image": f"{_STEAM}/814380/header.jpg",
        "screenshots": [
            f"{_STEAM}/814380/header.jpg",
            f"{_STEAM}/814380/capsule_616x353.jpg",
        ],
        "description": (
            "Set in late 1500s Sengoku Japan, Sekiro puts you in the role of a shinobi sworn to protect a young lord. "
            "Master the art of the blade, grapple across rooftops, and face enemies who will punish every mistake — "
            "until you don't make any."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 7/8.1/10 64-bit",
                "Processor": "Intel Core i3-8100 / AMD Ryzen 3 3300X",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 970 / AMD Radeon RX 470",
                "DirectX": "Version 11",
                "Storage": "25 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i7-8700K / AMD Ryzen 5 3600X",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 1070 8GB / AMD Radeon RX 5700",
                "DirectX": "Version 11",
                "Storage": "25 GB available space",
            },
        },
    },
    {
        "name": "Red Dead Redemption 2",
        "studio": "Rockstar Games",
        "publisher": "Rockstar Games",
        "release_date": "December 5, 2019",
        "genres": ["Action", "Open World", "Adventure"],
        "tags": ["western", "story-rich", "realistic", "sandbox"],
        "rating": 9.7,
        "price": 39.99,
        "image": f"{_STEAM}/1174180/header.jpg",
        "screenshots": [
            f"{_STEAM}/1174180/header.jpg",
            f"{_STEAM}/1174180/capsule_616x353.jpg",
        ],
        "description": (
            "Live the outlaw life in the most immersive open world ever built. "
            "As Arthur Morgan, navigate loyalty, survival, and the slow death of the Wild West "
            "in a story that stays with you long after the credits roll."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 7 64-bit",
                "Processor": "Intel Core i5-2500K / AMD FX-6300",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 770 2GB / AMD Radeon R9 280",
                "DirectX": "Version 11",
                "Storage": "150 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i7-4770K / AMD Ryzen 5 1500X",
                "Memory": "12 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB",
                "DirectX": "Version 12",
                "Storage": "150 GB available space",
            },
        },
    },
    {
        "name": "Mortal Shell",
        "studio": "Cold Symmetry",
        "publisher": "Playstack",
        "release_date": "August 18, 2020",
        "genres": ["Action", "Soulslike", "Indie"],
        "tags": ["dark", "gothic", "hard", "atmospheric"],
        "rating": 7.5,
        "price": 29.99,
        "image": f"{_STEAM}/1110910/header.jpg",
        "screenshots": [
            f"{_STEAM}/1110910/header.jpg",
            f"{_STEAM}/1110910/capsule_616x353.jpg",
        ],
        "description": (
            "A gothic soulslike where your only defense is possessing the empty shells of fallen warriors. "
            "Every enemy encounter is a deliberate test of patience and timing, "
            "wrapped in a dark, foreboding world that never explains itself."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5-4590 / AMD FX-8350",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GTX 970 / AMD Radeon R9 390X",
                "DirectX": "Version 11",
                "Storage": "18 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i7-6700K / AMD Ryzen 5 1600",
                "Memory": "16 GB RAM",
                "Graphics": "NVIDIA GTX 1070 / AMD RX 580",
                "DirectX": "Version 12",
                "Storage": "18 GB available space",
            },
        },
    },
    {
        "name": "Devil May Cry 5",
        "studio": "Capcom",
        "publisher": "Capcom",
        "release_date": "March 8, 2019",
        "genres": ["Action", "Hack and Slash"],
        "tags": ["stylish", "fast-paced", "demons", "combos"],
        "rating": 9.2,
        "price": 29.99,
        "image": f"{_STEAM}/601150/header.jpg",
        "screenshots": [
            f"{_STEAM}/601150/header.jpg",
            f"{_STEAM}/601150/capsule_616x353.jpg",
        ],
        "description": (
            "Three playable demon hunters, each with a radically different style. "
            "Style Meter combat has never looked or felt better — pull off ridiculous combos, "
            "earn S-ranks, and look incredibly cool doing it."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 7/8.1/10 64-bit",
                "Processor": "Intel Core i7-3770 / AMD FX-9590",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 760 / AMD Radeon R9 380",
                "DirectX": "Version 11",
                "Storage": "35 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i7-8700 / AMD Ryzen 5 1600",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 1080 / AMD RX 5700",
                "DirectX": "Version 12",
                "Storage": "35 GB available space",
            },
        },
    },
    {
        "name": "Dead Cells",
        "studio": "Motion Twin",
        "publisher": "Motion Twin",
        "release_date": "August 7, 2018",
        "genres": ["Action", "Roguelike", "Metroidvania"],
        "tags": ["indie", "pixel", "hard", "procedural"],
        "rating": 9.3,
        "price": 24.99,
        "image": f"{_STEAM}/588650/header.jpg",
        "screenshots": [
            f"{_STEAM}/588650/header.jpg",
            f"{_STEAM}/588650/capsule_616x353.jpg",
        ],
        "description": (
            "A roguelike-metroidvania where every run is different but every lesson carries forward. "
            "Die, learn, adapt, and push deeper into a cursed island that refuses to let you stay dead."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 7+",
                "Processor": "Intel i5+",
                "Memory": "2 GB RAM",
                "Graphics": "NVIDIA GTX 450 / AMD Radeon HD 5750 (1GB VRAM)",
                "DirectX": "Version 9",
                "Storage": "500 MB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel i7",
                "Memory": "4 GB RAM",
                "Graphics": "NVIDIA GeForce GTX 560 / AMD Radeon HD 7850",
                "DirectX": "Version 11",
                "Storage": "500 MB available space",
            },
        },
    },
    {
        "name": "Hollow Knight",
        "studio": "Team Cherry",
        "publisher": "Team Cherry",
        "release_date": "February 24, 2017",
        "genres": ["Action", "Metroidvania", "Indie"],
        "tags": ["atmospheric", "exploration", "difficult", "insects"],
        "rating": 9.5,
        "price": 14.99,
        "image": f"{_STEAM}/367520/header.jpg",
        "screenshots": [
            f"{_STEAM}/367520/header.jpg",
            f"{_STEAM}/367520/capsule_616x353.jpg",
        ],
        "description": (
            "Descend into Hallownest, a vast underground kingdom of insects and dreams. "
            "A precise, challenging adventure with a world dense enough to get genuinely lost in — "
            "and worth every moment of exploration."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 7",
                "Processor": "Intel Core 2 Duo E5200",
                "Memory": "4 GB RAM",
                "Graphics": "GeForce 9800GTX+ (1GB)",
                "DirectX": "Version 10",
                "Storage": "9 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5",
                "Memory": "8 GB RAM",
                "Graphics": "GeForce GTX 560 (1GB)",
                "DirectX": "Version 11",
                "Storage": "9 GB available space",
            },
        },
    },
    {
        "name": "Dispatch",
        "studio": "AdHoc Studio",
        "publisher": "AdHoc Studio",
        "release_date": "March 11, 2025",
        "genres": ["Strategy", "Narrative", "Indie"],
        "tags": ["superheroes", "tactical", "management", "story-rich", "comedy"],
        "rating": 8.5,
        "price": 29.99,
        "image": f"{_STEAM}/2592160/header.jpg",
        "screenshots": [
            f"{_STEAM}/2592160/header.jpg",
            f"{_STEAM}/2592160/capsule_616x353.jpg",
        ],
        "description": (
            "Lead a team of misfit superheroes through a city in crisis. "
            "A narrative strategy game about the messy reality of heroism — managing egos, "
            "making impossible calls, and keeping your city from falling apart."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5-4590 / AMD FX-8350",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GTX 970 / AMD RX 480",
                "DirectX": "Version 11",
                "Storage": "5 GB available space",
            },
            "recommended": {
                "OS": "Windows 10/11 64-bit",
                "Processor": "Intel Core i7-8700 / AMD Ryzen 5 3600",
                "Memory": "16 GB RAM",
                "Graphics": "NVIDIA GTX 1080 / AMD RX 5700",
                "DirectX": "Version 12",
                "Storage": "5 GB available space",
            },
        },
    },
    {
        "name": "God of War",
        "studio": "Santa Monica Studio",
        "publisher": "PlayStation PC LLC",
        "release_date": "January 14, 2022",
        "genres": ["Action", "Adventure"],
        "tags": ["mythology", "story-rich", "norse", "combat"],
        "rating": 9.6,
        "price": 49.99,
        "image": f"{_STEAM}/1593500/header.jpg",
        "screenshots": [
            f"{_STEAM}/1593500/header.jpg",
            f"{_STEAM}/1593500/capsule_616x353.jpg",
        ],
        "description": (
            "Kratos trades Greek myth for Norse legend and acquires a son along the way. "
            "A journey about fatherhood, grief, and the weight of the past, "
            "built around brutal yet deeply thoughtful combat."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5-6600K / AMD Ryzen 5 2600X",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GTX 1060 (6GB) / AMD RX 5500 XT (8GB)",
                "DirectX": "Version 11",
                "Storage": "70 GB available space",
            },
            "recommended": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i9-9900K / AMD Ryzen 9 3900X",
                "Memory": "16 GB RAM",
                "Graphics": "NVIDIA RTX 2070 Super (8GB) / AMD RX 5700 XT (8GB)",
                "DirectX": "Version 11",
                "Storage": "70 GB available space",
            },
        },
    },
    {
        "name": "God of War Ragnarök",
        "studio": "Santa Monica Studio",
        "publisher": "PlayStation PC LLC",
        "release_date": "September 19, 2024",
        "genres": ["Action", "Adventure"],
        "tags": ["mythology", "story-rich", "norse", "combat", "sequel"],
        "rating": 9.6,
        "price": 59.99,
        "image": f"{_STEAM}/2322010/header.jpg",
        "screenshots": [
            f"{_STEAM}/2322010/header.jpg",
            f"{_STEAM}/2322010/capsule_616x353.jpg",
        ],
        "description": (
            "The apocalypse is coming and Kratos cannot stop all of it — only choose how to face it. "
            "A massive, emotionally driven sequel that expands every system from its predecessor "
            "and raises the stakes even further."
        ),
        "system_requirements": {
            "minimum": {
                "OS": "Windows 10 64-bit",
                "Processor": "Intel Core i5-6600K / AMD Ryzen 5 2600X",
                "Memory": "8 GB RAM",
                "Graphics": "NVIDIA GTX 1060 (6GB) / AMD RX 5500 XT (8GB)",
                "DirectX": "Version 12",
                "Storage": "190 GB available space",
            },
            "recommended": {
                "OS": "Windows 10/11 64-bit",
                "Processor": "Intel Core i7-8700K / AMD Ryzen 7 3700X",
                "Memory": "16 GB RAM",
                "Graphics": "NVIDIA RTX 3080 (10GB) / AMD RX 6800 XT (16GB)",
                "DirectX": "Version 12",
                "Storage": "190 GB available space",
            },
        },
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
