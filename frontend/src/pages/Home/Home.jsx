import { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
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
  const { searchText, selectedGenres, selectedTags, selectedStudio, filterOrder } = useOutletContext();

  // The first filter the user checked (or null if no filters are active).
  // Encoded into the game URL so GameDetails can show the correct breadcrumb.
  const firstFilter = filterOrder[0] ?? null;


  // ── State ────────────────────────────────────

  const [games, setGames]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);


  // ── Data fetching ────────────────────────────

  useEffect(() => {
    axios.get(`${API_URL}/games`)
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
      // Filters by search. If nothing searched, return all games.
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
      // No studio selected = show all. Otherwise game's studio must match.
      !selectedStudio ||
      game.studio === selectedStudio
    );


  // ── Render ───────────────────────────────────

  return (
    <div className="home">
      <h1 className="home__title">All Games</h1>
      <div className="home__games-grid">
        {filteredGames.map((game) => (
          <Link
            to={`/games/${game._id}${firstFilter ? `?filter=${firstFilter.type}:${firstFilter.value}` : ""}`}
            key={game._id}
            className="home__game-link"
          >
            <GameCard game={game} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
