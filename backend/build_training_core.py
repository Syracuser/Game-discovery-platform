"""
build_training_core.py

Builds a VARIETY-FIRST training core: a set of games chosen to cover every RAWG
genre, so the ML model learns the full genre/tag pattern. Variety matters more
than size here — the model trains on this core but can then SCORE any game
(including live ones) via the genre/tag overlap pattern.

This is the per-genre sibling of import_rawg.py. Instead of grabbing one flat page
of "top games" (which clusters around popular AAA titles), it pulls the top games
from EACH genre, guaranteeing coverage.

It deliberately reuses import_rawg.py's pipeline (mapping, tag blocklist, dedupe,
posting) so there's a single source of truth for how a RAWG game becomes one of
our games.

Run from the backend folder, with the venv active AND the server running:
    python build_training_core.py
"""

import os
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Reuse the building blocks we already wrote and tested in import_rawg.py.
# Importing is safe: import_rawg's main() only runs under its own __main__ block.
from import_rawg import (
    map_rawg_game,
    get_existing_rawg_ids,
    post_game,
    _get_json,
)

load_dotenv()
RAWG_API_KEY = os.getenv("RAWG_API_KEY")
if not RAWG_API_KEY:
    raise SystemExit("RAWG_API_KEY not found. Is it set in backend/.env ?")

# How many top games to pull from EACH genre. Variety > size, so this stays small.
# 19 genres x 5 ≈ ~95 games. Tune later if the model has blind spots.
GAMES_PER_GENRE = 5

# Minimum number of tags a game must have to join the training core. Tags are
# where the real signal lives, so a game with too few makes a weak, near-empty
# training example. Skipping them keeps the core high-quality. Tune if needed.
MIN_TAGS = 3

# RAWG's 19 genre slugs (the API filters by slug, not display name).
# Confirmed live from RAWG's /genres endpoint.
GENRE_SLUGS = [
    "action", "indie", "adventure", "role-playing-games-rpg", "strategy",
    "shooter", "casual", "simulation", "puzzle", "arcade", "platformer",
    "massively-multiplayer", "racing", "sports", "fighting", "family",
    "board-games", "card", "educational",
]


# ── Fetching top games per genre ──────────────────────────────────────────────

def fetch_top_games_for_genre(slug: str, count: int) -> list[dict]:
    """
    Fetch full detail for the top `count` games in one genre, sorted by rating.

    Like import_rawg's fetch_games, this is a two-step process: the list endpoint
    returns lightweight summaries, so we collect ids from it, then fetch each
    game's full detail (which the mapper needs).

    The key difference from import_rawg: we filter by &genres=<slug> and sort by
    &ordering=-rating, so we get the BEST games OF THIS GENRE rather than the
    overall most popular games.
    """
    list_url = (
        f"https://api.rawg.io/api/games"
        f"?key={RAWG_API_KEY}&genres={slug}&ordering=-rating&page_size={count}"
    )
    summaries = _get_json(list_url).get("results", [])

    detailed = []
    for summary in summaries:
        game_id = summary["id"]
        detail_url = f"https://api.rawg.io/api/games/{game_id}?key={RAWG_API_KEY}"
        try:
            detailed.append(_get_json(detail_url))
        except urllib.error.HTTPError as e:
            # One bad game shouldn't kill the whole genre — log and continue.
            print(f"    ! Failed to fetch detail for game id {game_id}: {e}")

    return detailed


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f"Building training core: top {GAMES_PER_GENRE} games from each of "
          f"{len(GENRE_SLUGS)} genres.\n")

    # Games already in the DB (from past imports) — skip these.
    existing_ids = get_existing_rawg_ids()
    print(f"Found {len(existing_ids)} RAWG game(s) already in the database.\n")

    # Track ids added during THIS run too. A game can be a top game in two genres
    # (e.g. an Action-RPG), so without this it would be inserted twice in one run.
    added_this_run = set()

    added = 0
    skipped = 0

    for slug in GENRE_SLUGS:
        print(f"Genre: {slug}")
        raw_games = fetch_top_games_for_genre(slug, GAMES_PER_GENRE)

        for raw in raw_games:
            game = map_rawg_game(raw)
            rawg_id = game["rawg_id"]

            # Skip games with too few tags — they're weak training examples.
            if len(game["tags"]) < MIN_TAGS:
                print(f"    SKIP   {game['name']}  (only {len(game['tags'])} tags)")
                skipped += 1
            # Skip if already in the DB OR already added earlier in this same run.
            elif rawg_id in existing_ids or rawg_id in added_this_run:
                print(f"    SKIP   {game['name']}  (duplicate)")
                skipped += 1
            else:
                post_game(game)
                added_this_run.add(rawg_id)
                print(f"    ADDED  {game['name']}  (rating {game['rating']}, "
                      f"{len(game['genres'])} genres, {len(game['tags'])} tags)")
                added += 1

    print(f"\nDone. Added: {added} | Skipped: {skipped}")


if __name__ == "__main__":
    main()
