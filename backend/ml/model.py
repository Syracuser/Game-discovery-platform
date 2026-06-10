"""
ml/model.py

Trains a Logistic Regression model to predict whether a user will enjoy a game,
based on the overlap between the user's preferred genres/tags and a game's genres/tags.

To train and test: python -m ml.model
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


def generate_training_data(games: list[dict]) -> list[tuple]:
    """
    Automatically build training examples from the games already in the database.

    The old approach hand-wrote every example, which doesn't scale: when new games
    (e.g. from RAWG) bring brand-new genres, no hand-written row teaches the model
    about them. This function fixes that by generating examples from one honest rule:

        A user who likes a game's genres/tags will enjoy THAT game (and games like it),
        and will NOT enjoy a game that shares nothing with their taste.

    For each game we create:
      - 1 POSITIVE example (label 1): a user whose taste IS this game's genres/tags.
        High overlap -> they like it.
      - 1 NEGATIVE example (label 0): that same user paired with a game that shares
        ZERO genres. No overlap -> they don't like it.

    We generate one negative per positive so the dataset stays balanced (equal likes
    and dislikes). Balance matters: a lopsided dataset teaches the model to just
    always guess the majority label, which would make its scores useless.

    Returns rows in the same shape as the old RAW_DATA:
        (user_genres, user_tags, game_genres, game_tags, liked)
    """
    rows = []

    for game in games:
        game_genres = game.get("genres", [])
        game_tags   = game.get("tags", [])

        # Skip games with no genres — there's nothing meaningful to learn from them.
        if not game_genres:
            continue

        # POSITIVE: a user whose taste exactly matches this game's traits would like it.
        user_genres = game_genres
        user_tags   = game_tags
        rows.append((user_genres, user_tags, game_genres, game_tags, 1))

        # NEGATIVE: find a different game that shares NO genres with this user.
        # Sharing zero genres makes it a clean "dislike" — no risk of accidentally
        # teaching the model that overlapping games should be disliked.
        for other in games:
            if other is game:
                continue
            other_genres = other.get("genres", [])
            if not set(user_genres) & set(other_genres):  # empty intersection = no shared genres
                rows.append((user_genres, user_tags, other_genres, other.get("tags", []), 0))
                break  # one negative per positive keeps the dataset balanced

    return rows


def build_dataset(all_genres: list[str], all_tags: list[str], raw_data: list[tuple]):
    """
    Convert a list of training rows into numpy arrays the model can train on.

    `raw_data` is passed in (rather than read from a global) so we can train on
    either the old hand-written RAW_DATA or the auto-generated data and compare them.
    """
    X = []  # inputs: one feature vector per row
    y = []  # labels: 1 = liked, 0 = didn't like

    for user_genres, user_tags, game_genres, game_tags, liked in raw_data:
        X.append(build_feature_vector(user_genres, user_tags, game_genres, game_tags, all_genres, all_tags))
        y.append(liked)

    return np.array(X), np.array(y)


def train(all_genres: list[str], all_tags: list[str], raw_data: list[tuple]):
    """
    Train the model on the given training data and save it to disk.

    `raw_data` is the list of training rows to learn from — passed in so the caller
    chooses the data source (auto-generated, or the old hand-written RAW_DATA).

    We save the vocabulary (all_genres / all_tags) *inside* the same file as the
    model. The vocabulary defines what each position in the feature vector means,
    so the model is useless without it — bundling them keeps the two in sync and
    means the server never has to touch the database to know the vocabulary.
    """
    X, y = build_dataset(all_genres, all_tags, raw_data)

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


def evaluate(all_genres: list[str], all_tags: list[str], raw_data: list[tuple]):
    """
    Train on the given data and return (model, accuracy) WITHOUT saving to disk.

    Used to compare two datasets fairly: same vocabulary, same train/test split
    (random_state=42 makes the split identical every run), so any difference in
    accuracy comes from the data itself — not from luck in how rows were divided.
    """
    X, y = build_dataset(all_genres, all_tags, raw_data)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LogisticRegression()
    model.fit(X_train, y_train)
    accuracy = accuracy_score(y_test, model.predict(X_test))
    return model, accuracy


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

    # ── Compare old vs new training data before committing to either ──────────────
    # We train both ways on the SAME vocabulary and split, then compare accuracy.
    # Nothing is saved during this comparison — we only save further below.
    generated_data = generate_training_data(games)
    print(f"\nHand-written examples : {len(RAW_DATA)} rows")
    print(f"Auto-generated examples: {len(generated_data)} rows")

    _, old_acc = evaluate(all_genres, all_tags, RAW_DATA)
    _, new_acc = evaluate(all_genres, all_tags, generated_data)
    print(f"\nTest accuracy — hand-written : {old_acc:.0%}")
    print(f"Test accuracy — auto-generated: {new_acc:.0%}")

    # Train and SAVE the model using the auto-generated data (the scalable approach).
    print("\nTraining final model on auto-generated data...")
    model = train(all_genres, all_tags, generated_data)

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

    # Three real games to score — chosen to be very different so we can see clear contrast in predictions.
    # Red Dead Redemption 2 is included specifically to verify the "Story fan" can match a story-rich game.
    games_to_score = [
        {"name": "Red Dead Redemption 2", "genres": ["Action", "Open World", "Adventure"], "tags": ["western", "story-rich", "realistic", "sandbox"]},
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
