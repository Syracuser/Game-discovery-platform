"""
clear_rawg_games.py

Deletes ONLY the games that were imported from RAWG — i.e. games that have a
rawg_id. Your hand-added seed games (which have rawg_id = None) are left
completely untouched.

Why this exists: after adding the tag blocklist, the already-imported RAWG games
still hold their old un-filtered tags. This script removes them so we can
re-import cleanly with the blocklist active.

Safety: it first PRINTS exactly what it will delete and asks nothing destructive
until you confirm by re-running with the --confirm flag.

Run from the backend folder (venv active):
    python clear_rawg_games.py            # preview only — deletes nothing
    python clear_rawg_games.py --confirm  # actually deletes the RAWG games
"""

import sys
import asyncio
from database.connection import games_collection

# A game counts as "from RAWG" if its rawg_id field exists and isn't null.
RAWG_FILTER = {"rawg_id": {"$ne": None}}


async def preview():
    """Show which games WOULD be deleted, without deleting anything."""
    games = await games_collection.find(RAWG_FILTER).to_list(None)
    print(f"Found {len(games)} RAWG-imported game(s) that would be deleted:\n")
    for g in games:
        print(f"  - {g['name']}  (rawg_id: {g.get('rawg_id')})")

    # Also report how many games are NOT from RAWG, to reassure they're safe.
    total = await games_collection.count_documents({})
    print(f"\n{total - len(games)} hand-added game(s) will be KEPT (rawg_id is None).")
    return len(games)


async def delete():
    """Actually delete the RAWG-imported games."""
    result = await games_collection.delete_many(RAWG_FILTER)
    print(f"Deleted {result.deleted_count} RAWG-imported game(s).")
    remaining = await games_collection.count_documents({})
    print(f"{remaining} game(s) remain in the database.")


async def main():
    confirmed = "--confirm" in sys.argv

    count = await preview()

    if count == 0:
        print("\nNothing to delete.")
        return

    if confirmed:
        print("\n--confirm passed — deleting now...\n")
        await delete()
    else:
        print("\nThis was a PREVIEW. Nothing was deleted.")
        print("Re-run with --confirm to actually delete:")
        print("    python clear_rawg_games.py --confirm")


if __name__ == "__main__":
    asyncio.run(main())
