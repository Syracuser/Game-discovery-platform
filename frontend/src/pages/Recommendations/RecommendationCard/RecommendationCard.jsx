import { useState } from "react";
import { Link } from "react-router-dom";
import buildStars from "../../../utils/buildStars";
import "./RecommendationCard.css";

const MAX_VISIBLE_CHIPS = 5;

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

const MAX_EXPLANATION_ITEMS = 5;

/**
 * Computes the overlap between what the user selected and what the game has.
 * Returns { matchedGenres, matchedTags }, or null if there is no overlap at all.
 */
function getMatchData(selectedGenres, selectedTags, game) {
  const safeArr = (arr) => (Array.isArray(arr) ? arr : []); // Check that the item being looped on is an array.

  const matchedGenres = safeArr(selectedGenres).filter((g) =>
    safeArr(game.genres).includes(g) // Returns Genres that both the user selected and the game has.

  );
  const matchedTags = safeArr(selectedTags).filter((t) =>
    safeArr(game.tags).includes(t) 
  );

  if (matchedGenres.length === 0 && matchedTags.length === 0) return null;
  return { matchedGenres, matchedTags };
}

/**
 * Renders a list of matched values as JSX — each value is wrapped in a highlight span,
 * separated by commas, with a "+N more" suffix when the list is long.
 */
function renderHighlightedList(items) {
  const visible = items.slice(0, MAX_EXPLANATION_ITEMS);
  const extra = items.length - MAX_EXPLANATION_ITEMS;
  return (
    <>
      {visible.map((item, i) => (
        <span key={item}>
          <span className="rec-card__explanation-value">{item}</span>
          {i < visible.length - 1 && ", "}
        </span>
      ))}
      {extra > 0 && ` +${extra} more`}
    </>
  );
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

  const matchData = getMatchData(selectedGenres, selectedTags, game);

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

        {/* Explanation + rating grouped so they stay together at the card bottom */}
        <div className="rec-card__footer">

          {/* Match explanation — only shown when there is genre/tag overlap */}
          {matchData && (
            <p className="rec-card__explanation">
              {"Recommended for you because it matches your selected "}
              {matchData.matchedGenres.length > 0 && matchData.matchedTags.length > 0 && (
                <>
                  {"genres: "}{renderHighlightedList(matchData.matchedGenres)}
                  {" and tags: "}{renderHighlightedList(matchData.matchedTags)}
                </>
              )}
              {matchData.matchedGenres.length > 0 && matchData.matchedTags.length === 0 && (
                <>{"genres: "}{renderHighlightedList(matchData.matchedGenres)}</>
              )}
              {matchData.matchedTags.length > 0 && matchData.matchedGenres.length === 0 && (
                <>{"tags: "}{renderHighlightedList(matchData.matchedTags)}</>
              )}
              {"."}
            </p>
          )}

          {/* Rating (left) + CTA (right) — equal height, no dead space */}
          <div className="rec-card__bottom-row">
            <div className="rec-card__rating">
              <span className="rec-card__stars">{buildStars(game.rating)}</span>
              <span className="rec-card__rating-value">
                {(game.rating / 2).toFixed(1)}
              </span>
            </div>

            <Link to={`/games/rawg/${game.rawg_id}`} className="rec-card__view-btn">
              View Game →
            </Link>
          </div>

        </div>{/* end rec-card__footer */}

      </div>{/* end rec-card__content */}
    </div>
  );
}

export default RecommendationCard;
