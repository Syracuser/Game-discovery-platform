"""
import_rawg.py

Fetches real games from the RAWG API and adds them to the database.

This is the smarter sibling of add_games.py: instead of a hand-typed list of
games, it pulls live data from RAWG, reshapes each game to fit our GameModel,
and posts it to the running server's POST /games endpoint.

Safe to run multiple times — games already in the database (matched by their
unique rawg_id) are skipped automatically.

Run from the backend folder, with the venv active AND the server running:
    python import_rawg.py
"""

import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

# Load .env so we can read RAWG_API_KEY (os.getenv alone doesn't read the file).
load_dotenv()

RAWG_API_KEY = os.getenv("RAWG_API_KEY")
if not RAWG_API_KEY:
    raise SystemExit("RAWG_API_KEY not found. Is it set in backend/.env ?")

# Our own backend — we post games here, just like add_games.py does.
BASE_URL = "http://localhost:8000"

# How many games to import on this run. RAWG returns ~20 per page, so 1 page = ~20.
GAMES_TO_IMPORT = 20


# ── Tag blocklist ─────────────────────────────────────────────────────────────
# RAWG mixes real gameplay descriptors (Open World, Story Rich) with technical
# noise (Steam Achievements, controller support) and junk words. We drop the junk
# so the tags we store stay meaningful for filtering and the ML model.
#
# NOTE: this is a BLOCKLIST — it only removes tags we've explicitly named. It works
# well at our current small scale, but it can't scale to RAWG's thousands of unknown
# tags (new junk we haven't seen would slip through). The long-term plan is to flip
# to an ALLOWLIST ("only keep approved tags") once we import enough games to build
# one from real data. For now, a blocklist is the right-sized tool.
#
# Matching is case-insensitive (see _is_blocked), so we only list each tag once
# in lowercase and don't worry about RAWG's inconsistent capitalization.
TAG_BLOCKLIST = {
    # Group 1 — Steam platform features (not about the game itself)
    "steam achievements", "steam cloud", "steam workshop",
    "steam trading cards", "steam-trading-cards", "valve anti-cheat enabled",
    "includes source sdk", "includes level editor", "family sharing",
    "remote play on tv",
    # Group 2 — Controller / accessibility support (hardware & access info)
    "full controller support", "partial controller support", "controller",
    "controller support", "captions available", "commentary available",
    # Group 3 — Commercial / distribution noise
    "in-app purchases", "free to play", "exclusive", "true exclusive", "console",
    # Group 4 — Low-value junk words (single-use noise, not gameplay descriptors)
    "student", "strange", "destroy", "collect", "hunt", "gun", "rain",
    "enemy", "quick", "darkness", "defender", "city", "friends", "weapons",
    "skill", "online", "stats", "combat",
}


def _is_blocked(tag: str) -> bool:
    """
    True if a tag should be dropped — for either of two reasons:
      1. It's on the junk/technical blocklist (compared case-insensitively).
      2. It's non-English. RAWG returns some tags in other languages (e.g.
         Russian "Ремейк"). We keep tags English-only. `isascii()` is a simple,
         reliable heuristic: English gameplay tags are plain ASCII, while
         Cyrillic/Japanese/etc. are not. (It would also drop accented words like
         "café", but RAWG's real tags don't use those, so it's safe in practice.)
    """
    if not tag.isascii():
        return True
    return tag.lower() in TAG_BLOCKLIST


# ── Platform normalization ────────────────────────────────────────────────────
# RAWG returns specific console+generation names ("PlayStation 4", "Xbox 360"),
# but our frontend icon map only knows simple families ("PlayStation", "Xbox").
# We fold each RAWG platform into its family so cards show ONE icon per family.
# Anything not listed (mobile: iOS/Android, web, etc.) is dropped on purpose.

def _normalize_platforms(rawg_platform_names: list[str]) -> list[str]:
    """Map RAWG's specific platform names to our 4 icon families, dropping unknowns."""
    families = []
    for name in rawg_platform_names:
        lower = name.lower()
        if "playstation" in lower:
            family = "PlayStation"
        elif "xbox" in lower:
            family = "Xbox"
        elif "nintendo switch" in lower:
            family = "Nintendo Switch"
        elif lower in ("pc", "macos", "linux"):  # all desktop OSes -> PC
            family = "PC"
        else:
            continue  # mobile / web / anything else we don't have an icon for

        # Avoid duplicates (e.g. PS3 + PS4 should add "PlayStation" only once)
        if family not in families:
            families.append(family)
    return families


# ── Mapping: RAWG's shape -> our GameModel's shape ────────────────────────────

def map_rawg_game(raw: dict) -> dict:
    """
    Convert one raw RAWG game (the detail response) into a dict shaped like our
    GameModel. This is where every field transform from our mapping table happens.

    We use `(raw.get(field) or [])` for every list field because RAWG is
    inconsistent in TWO ways: a field can be MISSING, or present but explicitly
    null. `.get(field, [])` only covers the missing case — if the key exists with
    value None, it returns None and the comprehension below crashes with
    "'NoneType' object is not iterable". `or []` covers both: missing OR null -> [].
    """
    # genres and tags arrive as lists of objects: [{"name": "Action", ...}, ...]
    # We pull out just the .name from each, turning them into plain string lists.
    genres = [g["name"] for g in (raw.get("genres") or [])]
    # For tags, also drop any that are on the blocklist (junk/technical noise).
    tags   = [t["name"] for t in (raw.get("tags") or []) if not _is_blocked(t["name"])]

    # developers / publishers are also lists of objects. We take the FIRST one's
    # name as our studio / publisher. If the list is empty/null, fall back to "".
    developers = raw.get("developers") or []
    publishers = raw.get("publishers") or []
    studio    = developers[0]["name"] if developers else ""
    publisher = publishers[0]["name"] if publishers else ""

    # platforms are nested one level deeper: [{"platform": {"name": "PC"}}, ...]
    # Then normalize RAWG's specific names ("PlayStation 4") into our icon families
    # ("PlayStation"), dropping platforms we have no icon for (mobile, etc.).
    raw_platform_names = [p["platform"]["name"] for p in (raw.get("platforms") or [])]
    platforms = _normalize_platforms(raw_platform_names)

    # RAWG rating is on a 0–5 scale; our games use 0–10. Multiply by 2 to match.
    # round() keeps it tidy (e.g. 4.47 * 2 = 8.94 -> 8.9).
    rating = round(raw.get("rating", 0) * 2, 1)

    return {
        "name": raw.get("name", "Unknown"),
        "genres": genres,
        "tags": tags,
        "rating": rating,
        "studio": studio,
        "publisher": publisher,
        # background_image is RAWG's main image; description_raw is the clean
        # plain-text description (the plain "description" field has HTML tags).
        "image": raw.get("background_image") or "",
        "description": raw.get("description_raw", ""),
        "platforms": platforms,
        "release_date": raw.get("released") or "",
        "screenshots": [],          # skipped for now (separate RAWG endpoint)
        "system_requirements": {},  # skipped — RAWG provides these poorly
        "rawg_id": raw.get("id"),   # the unique fingerprint used for dedup
    }


# ── Fetching from RAWG ────────────────────────────────────────────────────────

def _get_json(url: str) -> dict:
    """Fetch a URL and parse the JSON response. A tiny shared helper."""
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read())
    



def fetch_games(limit: int) -> list[dict]:
    """
    Fetch full detail for `limit` games from RAWG.

    RAWG's list endpoint returns lightweight SUMMARIES (no description, partial
    developer info). So we use it only to collect game ids, then fetch each
    game's full DETAIL separately — that's what our mapper needs.

    page_size caps at how many summaries we ask for; we then loop the ids.
    """
    list_url = f"https://api.rawg.io/api/games?key={RAWG_API_KEY}&page_size={limit}"
    listing = _get_json(list_url)

    summaries = listing.get("results", [])
    print(f"RAWG returned {len(summaries)} game summaries. Fetching full details...\n")

    detailed_games = []
    for summary in summaries:
        game_id = summary["id"]
        detail_url = f"https://api.rawg.io/api/games/{game_id}?key={RAWG_API_KEY}"
        try:
            detail = _get_json(detail_url)
            detailed_games.append(detail)
        except urllib.error.HTTPError as e:
            # One bad game shouldn't kill the whole import — log it and move on.
            print(f"  ! Failed to fetch detail for game id {game_id}: {e}")

    return detailed_games


# ── Talking to our own backend (dedup + insert) ───────────────────────────────

def get_existing_rawg_ids() -> set:
    """
    Fetch all games already in our DB and return the set of rawg_ids among them.

    This is the dedup foundation (Problem 4): before inserting, we check a game's
    rawg_id against this set. We use rawg_id — RAWG's unique fingerprint — instead
    of the name, because names can collide or differ by a stray space, while ids
    never do. Games without a rawg_id (the old hand-added ones) are simply ignored
    here, since they can't clash with RAWG imports.
    """
    games = _get_json(f"{BASE_URL}/games")
    return {g["rawg_id"] for g in games if g.get("rawg_id") is not None}


def post_game(game: dict) -> dict:
    """Send a single mapped game to our POST /games endpoint (like add_games.py)."""
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
    print(f"Importing up to {GAMES_TO_IMPORT} games from RAWG.\n")

    # 1. Find out which RAWG games we already have, so we can skip them.
    existing_ids = get_existing_rawg_ids()
    print(f"Found {len(existing_ids)} RAWG game(s) already in the database.\n")

    # 2. Fetch full game details from RAWG.
    raw_games = fetch_games(GAMES_TO_IMPORT)

    added = 0
    skipped = 0

    # 3. Map -> dedup -> insert, one game at a time.
    for raw in raw_games:
        game = map_rawg_game(raw)

        if game["rawg_id"] in existing_ids:
            print(f"  SKIP   {game['name']}  (already imported)")
            skipped += 1
        else:
            post_game(game)
            print(f"  ADDED  {game['name']}  (rating {game['rating']}, {len(game['genres'])} genres)")
            added += 1

    print(f"\nDone. Added: {added} | Skipped: {skipped}")


if __name__ == "__main__":
    main()
