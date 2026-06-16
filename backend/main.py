import os
from dotenv import load_dotenv

# Load .env into the environment BEFORE anything reads it. This must come before
# importing database.connection, because that module reads MONGODB_URL at import
# time — if the .env isn't loaded yet, a custom URL (e.g. Atlas) would be missed
# and it would silently fall back to the localhost default.
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import database
from routes.games import router as games_router
from routes.recommend import router as recommend_router
from routes.options import router as options_router
from routes.browse import router as browse_router

"""
Lifespan controls what happens when the server starts and stops.

Think of it like opening and closing a shop:
- Opening (startup): turn on the lights, check everything works
- Closing (shutdown): clean up, turn off the lights

The 'yield' in the middle is where the server actually runs and
handles requests. Everything before yield = startup logic,
everything after yield = shutdown logic.
"""

@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup of app, runs the code below
    try:
    
        await database.command("ping")
        print("[OK] Connected to MongoDB successfully!")
    except Exception as e:
        print(f"[ERROR] Failed to connect to MongoDB: {e}")
    #  On shutdown of app, runs the code below
    yield

    print("[INFO] Shutting down server...")


app = FastAPI(lifespan=lifespan)

# Which frontend URLs are allowed to call this backend (the CORS "guest list").
# Local dev (Vite) is always allowed. In production we add the live frontend URL
# via the FRONTEND_URL environment variable on Render, so no code change is needed.
allowed_origins = ["http://localhost:5173"]  # React dev server
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def health_check():
    """Simple endpoint to confirm the backend is running ('is the shop open?')."""
    return {"status": "ok", "message": "Game Discovery API is running"}


# Connect game routes to the app
app.include_router(games_router)
app.include_router(recommend_router)
app.include_router(options_router)
app.include_router(browse_router)



