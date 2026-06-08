import { useState, useEffect } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import GameCard from "../../components/GameCard/GameCard";
import EmptyState from "./EmptyState/EmptyState";
import "./SearchResults.css";

// ─────────────────────────────────────────────
// SearchResults — dedicated page for search results.
// Reads the query from the URL (?q=...), fetches all
// games, and filters client-side by name match.
// ─────────────────────────────────────────────

function SearchResults() {

  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  // No query = nothing to search for, send the user back home.
  if (!query.trim()) return <Navigate to="/" replace />;

  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // Fetch all games.
  useEffect(() => {
    setLoading(true);
    setError(false);

    axios.get(`${API_URL}/games`)
      .then((res) => setGames(res.data))
      .catch((err) => {
        console.error("Failed to fetch games:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [query]);

  //  Only returns games that matched out user's query.
  const results = games.filter((game) =>
    game.name.toLowerCase().includes(query.toLowerCase())
  );

  // ── Render ───────────────────────────────────

  if (loading) {
    return (
      <div className="search-results__spinner-container">
        <div className="search-results__spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results">
        <p className="search-results__error">Failed to load games. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="search-results">

      <header className="search-results__header">
        <h1 className="search-results__title">Search results</h1>
        <p className="search-results__query">Results for: "<span>{query}</span>"</p>
        <span className="search-results__pill">{results.length} results found</span>
      </header>

{/* Display only the games that matched the user's query.*/}
      {results.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="search-results__grid">
          {results.map((game) => (
            <Link
              to={`/games/${game._id}`}
              key={game._id}
              className="search-results__game-link"
            >
              <GameCard game={game} />
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}

export default SearchResults;
