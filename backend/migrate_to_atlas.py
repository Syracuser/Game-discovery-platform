"""
One-time migration script: copy data from LOCAL MongoDB to ATLAS (cloud).

What it does:
- Reads every document from the local 'games' collection
- Inserts them into the Atlas 'games' collection
- Skips any games that already exist on Atlas (matched by 'name'),
  so it is safe to run more than once without creating duplicates.

Run once from the backend/ folder:
    ../.venv/Scripts/python.exe migrate_to_atlas.py
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()  # load backend/.env so we can read both connection strings

LOCAL_URL = os.getenv("MONGODB_URL")          # source: your computer
ATLAS_URL = os.getenv("MONGODB_ATLAS_URL")    # destination: the cloud
DATABASE_NAME = "game_discovery"              # must match database/connection.py
COLLECTION_NAME = "games"


async def main():
    # Open both connections (one to read from, one to write to)
    local_client = AsyncIOMotorClient(LOCAL_URL, serverSelectionTimeoutMS=8000)
    atlas_client = AsyncIOMotorClient(ATLAS_URL, serverSelectionTimeoutMS=8000)

    local_games = local_client[DATABASE_NAME][COLLECTION_NAME]
    atlas_games = atlas_client[DATABASE_NAME][COLLECTION_NAME]

    # Read everything from local into memory (fine for 54 small documents)
    documents = await local_games.find({}).to_list(length=None)
    print(f"Found {len(documents)} documents in local '{COLLECTION_NAME}'.")

    if not documents:
        print("Nothing to migrate. Exiting.")
        return

    inserted = 0
    skipped = 0
    for doc in documents:
        # Use 'name' to detect duplicates so re-running is safe.
        # We remove the local _id so Atlas can assign its own and avoid clashes.
        existing = await atlas_games.find_one({"name": doc.get("name")})
        if existing:
            skipped += 1
            continue

        doc.pop("_id", None)  # let Atlas generate a fresh _id
        await atlas_games.insert_one(doc)
        inserted += 1

    total_now = await atlas_games.count_documents({})
    print(f"Inserted: {inserted}, Skipped (already there): {skipped}")
    print(f"Atlas '{COLLECTION_NAME}' now has {total_now} documents total.")


if __name__ == "__main__":
    asyncio.run(main())
