import os
from motor.motor_asyncio import AsyncIOMotorClient

# Read the database address from the environment, fall back to localhost for local development.
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "game_discovery"

# Connect to MongoDB (like opening a door to the database server)
client = AsyncIOMotorClient(MONGODB_URL)

# Pick which database to use (like choosing a folder)
database = client[DATABASE_NAME]

# Pick which collection to use (like choosing a file inside that folder)
games_collection = database["games"]

"""
Database Connection Module

Sets up the connection to MongoDB using Motor (an async MongoDB driver).
Motor lets us talk to MongoDB without blocking other requests — this is
important because database queries are slow compared to regular code,
and we don't want the server to freeze while waiting for a response.

How it works:
- We create a "client" that connects to MongoDB
- From that client, we pick which database to use
- From that database, we pick which collection (think: table) to use
- Other files import what they need from here
"""