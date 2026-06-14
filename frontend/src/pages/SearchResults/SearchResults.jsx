import { useState, useEffect } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import GameCard from "../../components/GameCard/GameCard";
import EmptyState from "./EmptyState/EmptyState";
import BackButton from "../../components/BackButton/BackButton";
import useWishlist from "../../hooks/useWishlist";
import "./SearchResults.css";

// ─────────────────────────────────────────────
// SearchResults — dedicated page for search results.
// Reads the query from the URL (?q=...) and searches RAWG's FULL catalog live
// (via our /search endpoint), so any real game can be found — not just our
// stored DB games. Results are live games, so they use rawg_id.
// ─────────────────────────────────────────────

function SearchResults() {

  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const { addGame, removeGame, isWishlisted } = useWishlist();

  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  // Live search against RAWG via our backend. Re-runs whenever the query changes.
  useEffect(() => {
    if (!query.trim()) return;

    setLoading(true);
    setError(false);

    axios.get(`${API_URL}/search`, { params: { q: query } })
      .then((res) => setGames(res.data.results))
      .catch((err) => {
        console.error("Failed to search games:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [query]);

  function handleWishlistToggle(game) {
    isWishlisted(game.rawg_id) ? removeGame(game.rawg_id) : addGame(game);
  }

  // No query = nothing to search for, send the user back home.
  // (Placed after the hooks above so hook order stays consistent every render.)
  if (!query.trim()) return <Navigate to="/" replace />;

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

      <BackButton />

      <header className="search-results__header">
        <h1 className="search-results__title">Search results</h1>
        <p className="search-results__query">Results for: "<span>{query}</span>"</p>
        <span className="search-results__pill">{games.length} results found</span>
      </header>

      {games.length === 0 ? (
        <EmptyState query={query} />
      ) : (
        <div className="search-results__grid">
          {games.map((game) => (
            <Link
              to={`/games/rawg/${game.rawg_id}`}
              key={game.rawg_id}
              className="search-results__game-link"
            >
              <GameCard
                game={game}
                isWishlisted={isWishlisted(game.rawg_id)}
                onWishlistToggle={handleWishlistToggle}
              />
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}

export default SearchResults;
