import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import GameMediaGallery from "./GameMediaGallery/GameMediaGallery";
import GameSidebar from "./GameSidebar/GameSidebar";
import GameDescriptionSection from "./GameDescriptionSection/GameDescriptionSection";
import SystemRequirementsSection from "./SystemRequirementsSection/SystemRequirementsSection";
import BackButton from "../../components/BackButton/BackButton";
import "./GameDetails.css";

// ─────────────────────────────────────────────
// GameDetails — the full game detail page.
// Reads the game ID from the URL, 
// fetches that specific game,
// then renders all sections.
// ─────────────────────────────────────────────

// Parses "genre:Action" or "tag:dark" from the ?filter query param.
function parseFilterParam(param) {
  const colonIdx = param.indexOf(":");
  if (colonIdx === -1) return null;
  return { type: param.slice(0, colonIdx), value: param.slice(colonIdx + 1) };
}


function GameDetails() {
  // This one page serves TWO kinds of game:
  //  - stored DB games  → route /games/:id        → param `id`     (Mongo id)
  //  - live RAWG games  → route /games/rawg/:rawgId → param `rawgId` (RAWG id)
  // We detect which one we got and fetch from the matching endpoint. Everything
  // below (layout, sections) is identical because the live game is mapped to the
  // same shape as a stored game.
  const { id, rawgId } = useParams();
  const isLiveGame = Boolean(rawgId);

  const [searchParams] = useSearchParams();

  // Read the ?filter=genre:Action query param (null if the user arrived without a filter)
  const filterParam = searchParams.get("filter");
  const firstFilter = filterParam ? parseFilterParam(filterParam) : null;

  const [game, setGame]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);


  // ── Data fetching ────────────────────────────

  useEffect(() => {
    setLoading(true);
    setError(false);

    // Live games come from the RAWG passthrough endpoint; stored games from the DB.
    const url = isLiveGame
      ? `${API_URL}/rawg/${rawgId}`
      : `${API_URL}/games/${id}`;

    axios.get(url)
      .then((response) => setGame(response.data))
      .catch((err) => {
        console.error("Failed to fetch game:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [id, rawgId, isLiveGame]);


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




  // ── Render ───────────────────────────────────

  return (
    <div className="game-details">

      <BackButton />

      {/* ── Page header ─────────────────────────────
          Breadcrumb sits at the left edge.
          Title is centred across the full row.       */}
      <div className="game-details__header">

        <nav className="game-details__breadcrumb" aria-label="breadcrumb">
          <Link to="/" className="game-details__breadcrumb-link">Home</Link>
          <span className="game-details__breadcrumb-sep">›</span>
          <Link to="/" className="game-details__breadcrumb-link">Games</Link>

          {/* Only show the filter crumb if the user arrived via a filter */}
          {firstFilter && (
            <>
              <span className="game-details__breadcrumb-sep">›</span>
              <Link
                to="/"
                state={{ preselect: firstFilter }}
                className="game-details__breadcrumb-link"
              >
                {firstFilter.value}
              </Link>
            </>
          )}

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
