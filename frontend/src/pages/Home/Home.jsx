import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import GameCard from "../../components/GameCard/GameCard";
import "./Home.css";

// ─────────────────────────────────────────────
// Home — the main games listing page.
// Fetches all games and displays them in a grid,
// filtered by search text, genre, and studio.
// ─────────────────────────────────────────────

function Home() {

  // ── Context (from Layout) ────────────────────
  // These come from the Outlet — passed down by Layout
  const { searchText, selectedGenres, selectedTags, selectedStudios } = useOutletContext();


  // ── State ────────────────────────────────────

  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);


  // ── Data fetching ────────────────────────────

  useEffect(() => {
    axios.get("http://localhost:8000/games")
      .then((response) => setGames(response.data))
      .catch((error) => {
        console.error("Failed to fetch games:", error);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);


  // ── Early returns (loading / error) ─────────

  if (loading) {
    return (
      <div className="home__spinner-container">
        <div className="home__spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <p className="home__error">Failed to load games. Please try again later.</p>
      </div>
    );
  }


  // ── Filtering ────────────────────────────────
  // Apply search, genre, and studio filters before rendering

  const filteredGames = games
    .filter((game) =>
      game.name.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((game) =>
      // No genres selected = show all. Otherwise game must match ALL selected genres.
      selectedGenres.length === 0 ||
      selectedGenres.every((g) => game.genres.includes(g))
    )
    .filter((game) =>
      // No tags selected = show all. Otherwise game must have ALL selected tags.
      selectedTags.length === 0 ||
      selectedTags.every((t) => game.tags.includes(t))
    )
    .filter((game) =>
      // No studios selected = show all. Otherwise game's studio must be selected.
      selectedStudios.length === 0 ||
      selectedStudios.includes(game.studio)
    );


  // ── Render ───────────────────────────────────

  return (
    <div className="home">
      <h1 className="home__title">All Games</h1>
      <div className="home__games-grid">
        {filteredGames.map((game) => (
          <GameCard key={game._id} game={game} />
        ))}
      </div>
    </div>
  );
}

export default Home;
