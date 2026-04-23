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


# These lists are manually derived from the games currently in the database.
# The order matters — it defines positions in the feature vector.
# If you add new games with new genres or tags, update these lists and retrain the model.
ALL_GENRES = [
    "Action", "FPS", "Multiplayer", "Indie", "Soulslike",
    "Open World", "Adventure", "Hack and Slash", "Roguelike",
    "Metroidvania", "Strategy", "Narrative",
]

ALL_TAGS = [
    "fast-paced", "mechs", "parkour", "shooter", "retro", "stylish", "gore",
    "hard", "samurai", "japan", "stealth", "western", "story-rich", "realistic",
    "sandbox", "dark", "gothic", "atmospheric", "demons", "combos", "pixel",
    "procedural", "exploration", "difficult", "insects", "superheroes",
    "tactical", "management", "comedy", "mythology", "norse", "combat", "sequel",
]

# Path where the trained model will be saved after training
MODEL_PATH = os.path.join(os.path.dirname(__file__), "trained_model.pkl")


def build_feature_vector(
    user_genres: list[str], user_tags: list[str],
    game_genres: list[str], game_tags: list[str]
) -> list[int]:

    """
    Convert a user + game pair into a list of 1s and 0s.

    Each position represents one genre or tag. It's 1 if both the user
    and the game share it, and 0 otherwise. This overlap is what the
    model learns to associate with "liked" or "not liked".
    """
    genre_features = [1 if g in user_genres and g in game_genres else 0 for g in ALL_GENRES]
    tag_features   = [1 if t in user_tags   and t in game_tags   else 0 for t in ALL_TAGS]
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


def build_dataset():
    """Convert RAW_DATA into numpy arrays the model can train on."""
    X = []  # inputs: one feature vector per row
    y = []  # labels: 1 = liked, 0 = didn't like

    for user_genres, user_tags, game_genres, game_tags, liked in RAW_DATA:
        X.append(build_feature_vector(user_genres, user_tags, game_genres, game_tags))
        y.append(liked)

    return np.array(X), np.array(y)


def train():
    """Train the model on the synthetic dataset and save it to disk."""
    X, y = build_dataset()

    # Hold back 20% of the data to test on — the model never sees this during training
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LogisticRegression()
    model.fit(X_train, y_train)

    accuracy = accuracy_score(y_test, model.predict(X_test))
    print(f"Model trained. Test accuracy: {accuracy:.0%}")

    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to: {MODEL_PATH}")

    return model


def load_model():
    """Load the saved model from disk. Run train() first if it doesn't exist."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("No trained model found. Run ml/model.py first to train it.")
    return joblib.load(MODEL_PATH)


# ── Test block ────────────────────────────────────────────────────────────────
# This only runs when you execute this file directly: python ml/model.py
# It trains the model and prints sample predictions so you can verify it works.

if __name__ == "__main__":
    model = train()

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
            vec = build_feature_vector(user["genres"], user["tags"], game["genres"], game["tags"])

            # predict_proba returns [[prob_dislike, prob_like]] — [0][1] grabs the "like" probability
            prob = model.predict_proba([vec])[0][1]

            # :<20 left-aligns the game name in a 20-character-wide column so results line up neatly
            print(f"  {game['name']:<20} {prob:.0%} match")
