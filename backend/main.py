from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import database
from routes.games import router as games_router
from routes.recommend import router as recommend_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # On startup of app, runs the code below
    try:
    
        await database.command("ping")
        print("✅ Connected to MongoDB successfully!")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
    #  On shutdown of app, runs the code below
    yield
    
    print("👋 Shutting down server...")


app = FastAPI(lifespan=lifespan)

# Allow the frontend to make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Connect game routes to the app
app.include_router(games_router)
app.include_router(recommend_router)


"""
Lifespan controls what happens when the server starts and stops.

Think of it like opening and closing a shop:
- Opening (startup): turn on the lights, check everything works
- Closing (shutdown): clean up, turn off the lights

The 'yield' in the middle is where the server actually runs and
handles requests. Everything before yield = startup logic,
everything after yield = shutdown logic.
"""
