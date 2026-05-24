import { useState } from "react";
import { Link } from "react-router-dom";
import "./RecommendationCard.css";

const MAX_VISIBLE_CHIPS = 5;

// Converts a 0–10 rating to a 5-star string (e.g. 9.4 → "★★★★★").
function buildStars(rating) {
  const filled = Math.round(rating / 2);
  const empty = 5 - filled;
  return "★".repeat(filled) + "☆".repeat(empty);
}

// Returns the match label badge text based on rank and score.
function getMatchLabel(rank, score) {
  if (rank === 1) return "PERFECT PICK";
  const pct = score * 100;
  if (pct >= 80) return "STRONG MATCH";
  if (pct >= 60) return "GREAT MATCH";
  if (pct >= 40) return "GOOD MATCH";
  return "MATCH";
}

// Extracts the 4-digit year from a date string (handles "September 12, 2023", "2023", etc.).
function getReleaseYear(releaseDate) {
  if (!releaseDate) return "";
  const match = releaseDate.match(/\d{4}/);
  return match ? match[0] : "";
}

function RecommendationCard({ game, rank, selectedGenres, selectedTags }) {
  const [chipsExpanded, setChipsExpanded] = useState(false);

  const matchPct = Math.round(game.match_score * 100);
  const matchLabel = getMatchLabel(rank, game.match_score);
  const year = getReleaseYear(game.release_date);

  // Combine genres + tags into one chip list, split at MAX_VISIBLE_CHIPS.
  const allChips = [...(game.genres || []), ...(game.tags || [])];
  const visibleChips = allChips.slice(0, MAX_VISIBLE_CHIPS);
  const extraChips = allChips.slice(MAX_VISIBLE_CHIPS);
  const hasExtra = extraChips.length > 0;

  // A chip is highlighted if the user selected it as a preference.
  function isHighlighted(chip) {
    return selectedGenres.includes(chip) || selectedTags.includes(chip);
  }

  function chipClass(chip) {
    return `rec-card__chip ${
      isHighlighted(chip) ? "rec-card__chip--highlighted" : "rec-card__chip--muted"
    }`;
  }

  return (
    <div className="rec-card">

      {/* ── Left: image + rank badge ─────────────────── */}
      <div className="rec-card__image-area">
        <span className="rec-card__rank">#{rank}</span>
        {game.image ? (
          <img
            className="rec-card__image"
            src={game.image}
            alt={game.name}
          />
        ) : (
          <div className="rec-card__image-placeholder">✦</div>
        )}
      </div>

      {/* ── Right: all game info ─────────────────────── */}
      <div className="rec-card__content">

        {/* Match badges */}
        <div className="rec-card__badges">
          <span className="rec-card__match-label">✦ {matchLabel}</span>
          <span className="rec-card__match-pct">● {matchPct} % MATCH</span>
        </div>

        {/* Studio + year, directly above the title */}
        <span className="rec-card__studio-year">
          {game.studio}{year ? ` · ${year}` : ""}
        </span>

        {/* Game title */}
        <h2 className="rec-card__title">{game.name}</h2>

        {/* Genre / tag chips */}
        <div className="rec-card__chips">
          {/* Always-visible chips */}
          {visibleChips.map((chip) => (
            <span key={chip} className={chipClass(chip)}>
              {chip}
            </span>
          ))}

          {/* Extra chips — only rendered when expanded, animate in */}
          {chipsExpanded &&
            extraChips.map((chip, i) => (
              <span
                key={chip}
                className={`${chipClass(chip)} rec-card__chip--extra`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {chip}
              </span>
            ))}

          {/* Toggle pill */}
          {hasExtra && (
            <button
              className="rec-card__chip rec-card__chip--toggle"
              onClick={() => setChipsExpanded((prev) => !prev)}
            >
              {chipsExpanded ? "Show less" : `+${extraChips.length} more`}
            </button>
          )}
        </div>

        {/* Rating (left) + price & CTA (right) */}
        <div className="rec-card__bottom-row">
          <div className="rec-card__rating">
            <span className="rec-card__stars">{buildStars(game.rating)}</span>
            <span className="rec-card__rating-value">
              {(game.rating / 2).toFixed(1)}
            </span>
          </div>
          <div className="rec-card__actions">
            <span className="rec-card__price">
              {game.price === 0 ? "Free" : `$${game.price.toFixed(2)}`}
            </span>
            <Link to={`/games/${game._id}`} className="rec-card__view-btn">
              View Game →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RecommendationCard;
