# services/recommender.py
# Scores every game in the database against the user's preferences
# and returns them sorted by match probability (best match first).

from database.connection import games_collection
from ml.model import build_feature_vector, load_model


async def get_recommendations(user_genres: list[str], user_tags: list[str]) -> list[dict]:
    
    model = load_model()

    # Fetch all games from the database
    games = await games_collection.find().to_list()

    scored_games = []
    
    for game in games:
        # Build a feature vector for this user + game pair, then get the match probability
        vector = build_feature_vector(user_genres, user_tags, game["genres"], game["tags"])
        probability = model.predict_proba([vector])[0][1]  # probability that liked=1

        game["_id"] = str(game["_id"])
        game["match_score"] = round(probability, 2)
        scored_games.append(game)

    # Sort highest match score first
    scored_games.sort(key=lambda g: g["match_score"], reverse=True)

    return scored_games
