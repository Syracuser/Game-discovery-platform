import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import GameCard from "../../components/GameCard/GameCard";
import "./Home.css";

function Home() {
  const { searchText, selectedGenres, selectedStudios } = useOutletContext();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8000/games")
      .then((response) => {
        setGames(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch games:", error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Show spinner while loading
  if (loading) {
    return (
      <div className="home__spinner-container">
        <div className="home__spinner"></div>
      </div>
    );
  }

  // Show error message if fetch failed
  if (error) {
    return (
      <div className="home">
        <p className="home__error">Failed to load games. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="home">
      <h1 className="home__title">All Games</h1>
      <div className="home__games-grid">
        {/* Filter games by search text, selected genres, and selected studios */}
        {games
          .filter((game) =>
            game.name.toLowerCase().includes(searchText.toLowerCase())
          )
          .filter((game) =>
            // If no genres selected, show all. Otherwise, game must include ALL selected genres.
            selectedGenres.length === 0 ||
            selectedGenres.every((g) => game.genres.includes(g))
          )
          .filter((game) =>
            // If no studios selected, show all. Otherwise, game's studio must be selected.
            selectedStudios.length === 0 ||
            selectedStudios.includes(game.studio)
          )
          .map((game) => (
            <GameCard key={game._id} game={game} />
          ))}
      </div>
    </div>
  );
}

export default Home;
