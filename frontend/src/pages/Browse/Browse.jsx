import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import GameCard from "../../components/GameCard/GameCard";
import Pagination from "../../components/Pagination/Pagination";
import Spinner from "../../components/Spinner/Spinner";
import useWishlist from "../../hooks/useWishlist";
import "./Browse.css";

// ─────────────────────────────────────────────
// Browse — ONE page used for all three live-RAWG sections.
// The route passes `section` ("popular" | "new" | "trending"),
// and this maps it to the matching backend endpoint + page title.
// Avoids three near-identical page files.
// ─────────────────────────────────────────────

// Section config: maps the `section` prop to its endpoint and display title.
const SECTIONS = {
  popular:  { endpoint: "/popular",  title: "Most Popular" },
  new:      { endpoint: "/new",      title: "New Releases" },
  trending: { endpoint: "/trending", title: "Trending Now" },
};

function Browse({ section }) {
  const config = SECTIONS[section];

  // Current page lives in the URL (?p=2) so it survives refresh and is shareable.
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get("p") ?? "1", 10);

  const [games,   setGames]   = useState([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const { addGame, removeGame, isWishlisted } = useWishlist();

  // Live games use rawg_id (they have no Mongo _id). Wishlisting live games is
  // handled fully in the next step; for now toggling is keyed on rawg_id.
  function handleWishlistToggle(game) {
    isWishlisted(game.rawg_id) ? removeGame(game.rawg_id) : addGame(game);
  }

  // Fetch this section's page whenever the section or page number changes.
  useEffect(() => {
    setLoading(true);
    setError(false);

    axios.get(`${API_URL}${config.endpoint}`, { params: { page } })
      .then((res) => {
        setGames(res.data.results);
        setHasNext(res.data.has_next);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${section}:`, err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [section, page, config.endpoint]);

  // Update the page number in the URL; Pagination calls this on Prev/Next.
  function goToPage(newPage) {
    setSearchParams({ p: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Render ───────────────────────────────────

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="browse">
        <p className="browse__error">Failed to load games. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="browse">
      <header className="browse__header">
        <h1 className="browse__title">{config.title}</h1>
      </header>

      <div className="browse__grid">
        {games.map((game) => (
          <Link
            to={`/games/rawg/${game.rawg_id}`}
            key={game.rawg_id}
            className="browse__game-link"
          >
            <GameCard
              game={game}
              isWishlisted={isWishlisted(game.rawg_id)}
              onWishlistToggle={handleWishlistToggle}
            />
          </Link>
        ))}
      </div>

      <Pagination page={page} hasNext={hasNext} onChange={goToPage} />
    </div>
  );
}

export default Browse;
