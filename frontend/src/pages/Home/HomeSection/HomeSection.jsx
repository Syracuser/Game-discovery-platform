import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../../api/config";
import GameCard from "../../../components/GameCard/GameCard";
import "./HomeSection.css";

// ─────────────────────────────────────────────
// HomeSection — one live section row on the Home page:
// a title, a "View All" link, and a row of ~12 live RAWG cards.
//
// Fetches its own data from /<sectionKey> (e.g. /popular). Each section
// loads independently, so one slow section doesn't block the others.
// ─────────────────────────────────────────────

function HomeSection({ sectionKey, title, Icon, isWishlisted, onWishlistToggle }) {
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/${sectionKey}`)
      .then((res) => setGames(res.data.results))
      .catch((err) => {
        console.error(`Failed to fetch ${sectionKey}:`, err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [sectionKey]);

  return (
    <section className="home__section">
      <div className="home__section-head">
        <h2 className="home__section-title">
          {Icon && <Icon className="home__section-icon" />}
          {title}
        </h2>
        <Link to={`/${sectionKey}`} className="home__view-all">View All →</Link>
      </div>

      {loading ? (
        <div className="home__section-loading">Loading…</div>
      ) : error ? (
        <p className="home__error">Couldn’t load this section.</p>
      ) : (
        <div className="home__row">
          {games.map((game) => (
            <Link
              to={`/games/rawg/${game.rawg_id}`}
              key={game.rawg_id}
              className="game-link"
            >
              <GameCard
                game={game}
                isWishlisted={isWishlisted(game.rawg_id)}
                onWishlistToggle={onWishlistToggle}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default HomeSection;
