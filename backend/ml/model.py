"""
ml/model.py

Trains a Logistic Regression model to predict whether a user will enjoy a game,
based on the overlap between the user's preferred genres/tags and a game's genres/tags.

To train and test: python ml/model.py
"""

import os
import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


# Path where the trained model will be saved after training
MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.pkl")


def fetch_vocab_from_db(games: list[dict]) -> tuple[list[str], list[str]]:
    """
    Given a list of game dicts, collect all unique genres and tags.
    Returns two sorted lists: (ALL_GENRES, ALL_TAGS).
    Sorted so the order is stable and consistent across retrains —
    this matters because the order defines positions in the feature vector.
    """
    genres = sorted(set(g for game in games for g in game.get("genres", [])))
    tags   = sorted(set(t for game in games for t in game.get("tags",   [])))
    return genres, tags


def build_feature_vector(
    user_genres: list[str], user_tags: list[str],
    game_genres: list[str], game_tags: list[str],
    all_genres: list[str], all_tags: list[str],
) -> list[int]:

    """
    Convert a user + game pair into a list of 1s and 0s.

    Each position represents one genre or tag. It's 1 if both the user
    and the game share it, and 0 otherwise. This overlap is what the
    model learns to associate with "liked" or "not liked".

    `all_genres` / `all_tags` are the vocabulary (the full ordered list of
    every known genre/tag). They're passed in rather than read from a global
    so this function never depends on import-time state.
    """
    genre_features = [1 if g in user_genres and g in game_genres else 0 for g in all_genres]
    tag_features   = [1 if t in user_tags   and t in game_tags   else 0 for t in all_tags]
    return genre_features + tag_features


# ── Synthetic training data ───────────────────────────────────────────────────
# Format: (user_genres, user_tags, game_genres, game_tags, liked)
# liked=1 means this user would enjoy this game, liked=0 means they wouldn't.
# Based on real games in the database — enough variety for the model to learn patterns.

RAW_DATA = [
    # FPS fans enjoy FPS games
    (["Action", "FPS"], ["fast-paced", "shooter"], ["Action", "FPS", "Multiplayer"], ["fast-paced", "mechs", "parkour", "shooter"], 1),
    (["Action", "FPS"], ["fast-paced", "shooter"], ["Action", "FPS", "Indie"],       ["fast-paced", "retro", "stylish", "gore"],     1),
    (["Action", "FPS"], ["fast-paced", "shooter"], ["Action", "Soulslike"],          ["hard", "samurai", "japan", "stealth"],         0),
    (["Action", "FPS"], ["fast-paced", "shooter"], ["Strategy", "Narrative", "Indie"], ["superheroes", "tactical", "management"],    0),

    # Soulslike fans enjoy hard, atmospheric games
    (["Action", "Soulslike"], ["hard", "atmospheric"], ["Action", "Soulslike"],          ["hard", "samurai", "japan", "stealth"],        1),
    (["Action", "Soulslike"], ["hard", "atmospheric"], ["Action", "Soulslike", "Indie"], ["dark", "gothic", "hard", "atmospheric"],      1),
    (["Action", "Soulslike"], ["hard", "atmospheric"], ["Action", "FPS", "Multiplayer"], ["fast-paced", "mechs", "parkour", "shooter"],  0),
    (["Action", "Soulslike"], ["hard", "atmospheric"], ["Strategy", "Narrative", "Indie"], ["superheroes", "tactical", "management"],   0),

    # Story/open world fans enjoy narrative-rich games
    (["Adventure", "Open World"], ["story-rich", "realistic"], ["Action", "Open World", "Adventure"], ["western", "story-rich", "realistic", "sandbox"], 1),
    (["Adventure", "Open World"], ["story-rich", "realistic"], ["Action", "Adventure"],               ["mythology", "story-rich", "norse", "combat"],    1),
    (["Adventure", "Open World"], ["story-rich", "realistic"], ["Action", "Roguelike", "Metroidvania"], ["pixel", "hard", "procedural"],                  0),
    (["Adventure", "Open World"], ["story-rich", "realistic"], ["Action", "FPS", "Indie"],             ["fast-paced", "retro", "stylish", "gore"],        0),

    # Metroidvania fans enjoy exploration-heavy indie games
    (["Action", "Metroidvania", "Indie"], ["atmospheric", "exploration", "difficult"], ["Action", "Metroidvania", "Indie"],     ["atmospheric", "exploration", "difficult", "insects"], 1),
    (["Action", "Metroidvania", "Indie"], ["atmospheric", "exploration", "difficult"], ["Action", "Roguelike", "Metroidvania"], ["pixel", "hard", "procedural"],                        1),
    (["Action", "Metroidvania", "Indie"], ["atmospheric", "exploration", "difficult"], ["Action", "FPS", "Multiplayer"],        ["fast-paced", "mechs", "parkour", "shooter"],          0),
    (["Action", "Metroidvania", "Indie"], ["atmospheric", "exploration", "difficult"], ["Action", "Open World", "Adventure"],   ["western", "story-rich", "realistic", "sandbox"],      0),

    # Hack and Slash fans enjoy stylish, fast combat
    (["Action", "Hack and Slash"], ["stylish", "fast-paced", "combos"], ["Action", "Hack and Slash"],    ["stylish", "fast-paced", "demons", "combos"],         1),
    (["Action", "Hack and Slash"], ["stylish", "fast-paced", "combos"], ["Action", "FPS", "Indie"],      ["fast-paced", "retro", "stylish", "gore"],             1),
    (["Action", "Hack and Slash"], ["stylish", "fast-paced", "combos"], ["Strategy", "Narrative", "Indie"], ["superheroes", "tactical", "management", "comedy"], 0),
    (["Action", "Hack and Slash"], ["stylish", "fast-paced", "combos"], ["Action", "Soulslike"],         ["hard", "samurai", "japan", "stealth"],                0),

    # Strategy fans enjoy tactical, story-driven games
    (["Strategy", "Narrative"], ["tactical", "story-rich", "management"], ["Strategy", "Narrative", "Indie"], ["superheroes", "tactical", "management", "story-rich", "comedy"], 1),
    (["Strategy", "Narrative"], ["tactical", "story-rich", "management"], ["Action", "FPS", "Multiplayer"],    ["fast-paced", "mechs", "parkour", "shooter"],                    0),
    (["Strategy", "Narrative"], ["tactical", "story-rich", "management"], ["Action", "Hack and Slash"],        ["stylish", "fast-paced", "demons", "combos"],                    0),
]


def build_dataset(all_genres: list[str], all_tags: list[str]):
    """Convert RAW_DATA into numpy arrays the model can train on."""
    X = []  # inputs: one feature vector per row
    y = []  # labels: 1 = liked, 0 = didn't like

    for user_genres, user_tags, game_genres, game_tags, liked in RAW_DATA:
        X.append(build_feature_vector(user_genres, user_tags, game_genres, game_tags, all_genres, all_tags))
        y.append(liked)

    return np.array(X), np.array(y)


def train(all_genres: list[str], all_tags: list[str]):
    """
    Train the model on the synthetic dataset and save it to disk.

    We save the vocabulary (all_genres / all_tags) *inside* the same file as the
    model. The vocabulary defines what each position in the feature vector means,
    so the model is useless without it — bundling them keeps the two in sync and
    means the server never has to touch the database to know the vocabulary.
    """
    X, y = build_dataset(all_genres, all_tags)

    # Hold back 20% of the data to test on — the model never sees this during training
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LogisticRegression()
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"Model trained. Test accuracy: {accuracy:.0%}")

    # Save the model together with its vocabulary as one bundle
    bundle = {"model": model, "all_genres": all_genres, "all_tags": all_tags}
    joblib.dump(bundle, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")

    return model


def load_model() -> tuple:
    """
    Load the saved bundle from disk. Run train() first if it doesn't exist.
    Returns (model, all_genres, all_tags) — the model plus the vocabulary it was trained on.
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("No trained model found. Run ml/model.py first to train it.")
    bundle = joblib.load(MODEL_PATH)
    return bundle["model"], bundle["all_genres"], bundle["all_tags"]


# ── Test block ────────────────────────────────────────────────────────────────
# This only runs when you execute this file directly: python ml/model.py
# It reads the vocabulary from the database, trains the model, then prints
# sample predictions so you can verify it works.
#
# Reading the database with asyncio.run() is safe HERE (but not when imported by
# the server) because running this file directly has no event loop yet — so
# asyncio.run() is free to create its own. The server already has a running loop,
# which is why it loads the vocabulary from the saved model file instead.

if __name__ == "__main__":
    import asyncio
    from database.connection import games_collection

    async def _load_games():
        return await games_collection.find({}, {"genres": 1, "tags": 1}).to_list(None)

    games = asyncio.run(_load_games())
    all_genres, all_tags = fetch_vocab_from_db(games)
    print(f"Vocabulary from DB: {len(all_genres)} genres, {len(all_tags)} tags")

    model = train(all_genres, all_tags)

    print("\n--- Sample Predictions ---")

    # A few different user types to test against two very different games
    test_cases = [
        {
            "label": "FPS fan",
            "genres": ["Action", "FPS"],
            "tags": ["fast-paced", "shooter"],
        },
        {
            "label": "Soulslike fan",
            "genres": ["Action", "Soulslike"],
            "tags": ["hard", "atmospheric"],
        },
        {
            "label": "Story fan",
            "genres": ["Adventure", "Open World"],
            "tags": ["story-rich", "realistic"],
        },
    ]

    # Three real games to score — chosen to be very different so we can see clear contrast in predictions
    games_to_score = [
        {"name": "Titanfall 2",  "genres": ["Action", "FPS", "Multiplayer"], "tags": ["fast-paced", "mechs", "parkour", "shooter"]},
        {"name": "Hollow Knight", "genres": ["Action", "Metroidvania", "Indie"], "tags": ["atmospheric", "exploration", "difficult", "insects"]},
        {"name": "Sekiro",        "genres": ["Action", "Soulslike"],              "tags": ["hard", "samurai", "japan", "stealth"]},
    ]

    # For each test user, score every game and print the predicted match percentage
    for user in test_cases:
        print(f"\n{user['label']} ({user['genres']}):")
        for game in games_to_score:
            # Build the overlap vector between this user's preferences and this game's traits
            vec = build_feature_vector(user["genres"], user["tags"], game["genres"], game["tags"], all_genres, all_tags)

            # predict_proba returns [[prob_dislike, prob_like]] — [0][1] grabs the "like" probability
            prob = model.predict_proba([vec])[0][1]

            # :<20 left-aligns the game name in a 20-character-wide column so results line up neatly
            print(f"  {game['name']:<20} {prob:.0%} match")
