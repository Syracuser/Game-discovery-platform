# 🎮 Game Discovery Platform

A full-stack web app for finding video games worth playing. Tell it the genres and
tags you're into, and a small machine learning model ranks games by how likely you
are to enjoy them - and tells you why it picked each one. Game data comes from the
[RAWG](https://rawg.io) database.

## What it does

- Browse trending, popular, and newly released games
- Search for games by name
- Open a game to see its details, screenshots, and metadata
- Get recommendations by picking the genres and tags you like, ranked by an ML model
- Keep a wishlist (saved in your browser - no account needed)

## Built with

- **Frontend:** React + Vite, React Router, Axios
- **Backend:** Python, FastAPI
- **Database:** MongoDB
- **Machine Learning:** scikit-learn (Logistic Regression)
- **Game Data:** RAWG API

## Running it locally

### Prerequisites

- Python 3.11+ and Node.js 20.19+ (or 22.12+)
- MongoDB — either a local [Community Server](https://www.mongodb.com/try/download/community) on the default port (27017), or a free [Atlas](https://www.mongodb.com/atlas) cluster
- A free [RAWG API key](https://rawg.io/apidocs) (the recommendation feature fetches games from RAWG live)

Make sure MongoDB is running before you start the backend. The backend and frontend
run as separate processes, so you'll use a couple of terminals.

First, clone the repo:

```bash
git clone https://github.com/Syracuser/Game-discovery-platform.git
cd Game-discovery-platform
```

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env           # Windows (cmd): copy .env.example .env
```

⚠️ Before launching, open `backend/.env` and fill in your values — your
`MONGODB_URL` and `RAWG_API_KEY` (see [Environment variables](#environment-variables)
below). Then start the server:

```bash
uvicorn main:app --reload
```

This serves the API on `http://localhost:8000`, with interactive docs at `/docs`.

**Load some games:**

A fresh database is empty, so there's nothing to browse or recommend yet. With the
server still running, open a second terminal and seed it. You can use the built-in
sample games, pull live ones from RAWG, or both:

```bash
cd backend
source .venv/bin/activate      # Windows: .venv\Scripts\Activate.ps1
python add_games.py            # a curated set of sample games
python import_rawg.py          # (optional) pull more games from the RAWG API
```

Both scripts skip anything already in the database, so they're safe to re-run.

**Frontend:**

```bash
cd frontend
npm install
cp .env.example .env           # Windows (cmd): copy .env.example .env
npm run dev
```

The frontend `.env` already points at `http://localhost:8000`, so no edits are needed.

Then open `http://localhost:5173` in your browser.

## Environment variables

Each side has its own `.env` file, created from the matching `.env.example`.

**`backend/.env`**

```env
# Your MongoDB connection string (local default shown)
MONGODB_URL=mongodb://localhost:27017/gamediscovery

# RAWG API key — get a free one at https://rawg.io/apidocs
RAWG_API_KEY=your_rawg_api_key_here
```

**`frontend/.env`**

```env
# The URL where the backend is running
VITE_API_URL=http://localhost:8000
```

## A note on this project

This started as a learning project, so the goal was a complete, understandable
system over a clever one - especially the recommendation model, which is kept
deliberately simple.
