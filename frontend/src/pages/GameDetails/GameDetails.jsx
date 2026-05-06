import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import GameMediaGallery from "./GameMediaGallery";
import GameSidebar from "./GameSidebar";
import GameDescriptionSection from "./GameDescriptionSection";
import SystemRequirementsSection from "./SystemRequirementsSection";
import "./GameDetails.css";

// ─────────────────────────────────────────────
// GameDetails — the full game detail page.
// Reads the game ID from the URL, 
// fetches that specific game,
// then renders all sections.
// ─────────────────────────────────────────────

function GameDetails() {
  const { id } = useParams();

  const [game, setGame]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);


  // ── Data fetching ────────────────────────────

  useEffect(() => {
    setLoading(true);
    setError(false);
// Fetch a specific game 
    axios.get(`${API_URL}/games/${id}`)
      .then((response) => setGame(response.data))
      .catch((err) => {
        console.error("Failed to fetch game:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id]);


  // ── Early returns ────────────────────────────

  if (loading) {
    return (
      <div className="game-details__spinner-container">
        <div className="game-details__spinner"></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="game-details">
        <p className="game-details__error">Failed to load game. Please try again.</p>
      </div>
    );
  }


  // ── Breadcrumb ───────────────────────────────
  // Use the first genre from the 'Genres' list as the middle crumb 
  const primaryGenre = game.genres[0] || "Games";


  // ── Render ───────────────────────────────────

  return (
    <div className="game-details">

      {/* ── Page header ─────────────────────────────
          Breadcrumb sits at the left edge.
          Title is centred across the full row.       */}
      <div className="game-details__header">

        <nav className="game-details__breadcrumb" aria-label="breadcrumb">
          <Link to="/" className="game-details__breadcrumb-link">Home</Link>
          <span className="game-details__breadcrumb-sep">›</span>
          <Link to="/" className="game-details__breadcrumb-link">Games</Link>
          <span className="game-details__breadcrumb-sep">›</span>
          <span className="game-details__breadcrumb-current">{primaryGenre}</span>
          <span className="game-details__breadcrumb-sep">›</span>
          <span className="game-details__breadcrumb-current">{game.name}</span>
        </nav>

        <h1 className="game-details__title">{game.name}</h1>

      </div>


      {/* ── Two-column body ─────────────────────────
          Left  — gallery, description, system requirements
          Right — sidebar (cover, genres, tags, buttons, metadata) */}
      <div className="game-details__body">

        <div className="game-details__left">
          <GameMediaGallery screenshots={game.screenshots} name={game.name} />
          <GameDescriptionSection description={game.description} />
          <SystemRequirementsSection systemRequirements={game.system_requirements} />
        </div>

        {/* Right — sidebar with cover, genres, tags, actions, metadata */}
        <aside className="game-details__right">
          <GameSidebar game={game} />
        </aside>

      </div>

    </div>
  );
}

export default GameDetails;
