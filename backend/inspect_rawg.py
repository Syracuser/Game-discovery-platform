"""
inspect_rawg.py  —  THROWAWAY inspection script (safe to delete later)

Purpose: fetch ONE game from the RAWG API and print its real field shapes,
so we can confirm how RAWG's data is actually structured before writing any
import/mapping code. This does NOT touch the database — it only looks.

Run from the backend folder (with venv active):
    python inspect_rawg.py
"""

import os
import json
import urllib.request
from dotenv import load_dotenv

# Load the .env file into the environment so os.getenv can see RAWG_API_KEY.
# (Your app relies on a fallback default for MONGODB_URL, but the RAWG key has
#  no fallback, so we must load .env explicitly here.)
load_dotenv()

API_KEY = os.getenv("RAWG_API_KEY")
if not API_KEY:
    raise SystemExit("RAWG_API_KEY not found. Is it set in backend/.env ?")


def fetch_one_game() -> dict:
    """
    Get the games list (just the first page), then fetch the FULL detail of the
    first game. We look at the detail endpoint because RAWG's list response and
    its single-game detail response have slightly different fields — the detail
    view is what we'd actually import from.
    """
    # Step 1: get a page of games so we can grab one real game id.
    list_url = f"https://api.rawg.io/api/games?key={API_KEY}&page_size=3"
    with urllib.request.urlopen(list_url) as resp:
        listing = json.loads(resp.read())

    print(f"List endpoint: total count = {listing.get('count')}")
    print(f"Results on this page = {len(listing.get('results', []))}\n")

    first_id = listing["results"][0]["id"]

    # Step 2: fetch the full detail for that one game.
    detail_url = f"https://api.rawg.io/api/games/{first_id}?key={API_KEY}"
    with urllib.request.urlopen(detail_url) as resp:
        return json.loads(resp.read())


def main():
    game = fetch_one_game()

    print("=" * 70)
    print(f"GAME: {game.get('name')}  (rawg id: {game.get('id')})")
    print("=" * 70)

    # The specific fields we had open questions about:
    print("\n--- Fields we need to confirm ---")
    print(f"rating          : {game.get('rating')}")
    print(f"rating_top (max): {game.get('rating_top')}   <- tells us the scale (e.g. 5)")
    print(f"background_image: {game.get('background_image')}")
    print(f"genres (raw)    : {json.dumps(game.get('genres'), indent=2)[:400]}")
    print(f"tags (first 3)  : {json.dumps(game.get('tags', [])[:3], indent=2)}")
    print(f"developers      : {json.dumps(game.get('developers'), indent=2)[:300]}")
    print(f"publishers      : {json.dumps(game.get('publishers'), indent=2)[:300]}")
    print(f"platforms (1st) : {json.dumps(game.get('platforms', [])[:1], indent=2)[:300]}")
    print(f"released        : {game.get('released')}")
    print(f"description (raw, first 150 chars): {str(game.get('description'))[:150]}")
    print(f"has 'price' field? : {'price' in game}")
    print(f"has 'studio' field?: {'studio' in game}")

    # The complete list of top-level keys, so we see EVERYTHING available.
    print("\n--- ALL top-level keys RAWG returned ---")
    print(sorted(game.keys()))

    # System requirements: RAWG buries these inside each platform entry (PC only),
    # under platforms[].requirements. Let's see what that actually looks like.
    print("\n--- System requirements (nested inside platforms) ---")
    for p in game.get("platforms", []):
        platform_name = p.get("platform", {}).get("name")
        requirements = p.get("requirements")  # may be None or {} for non-PC
        print(f"{platform_name}: requirements = {json.dumps(requirements)[:500]}")


if __name__ == "__main__":
    main()
