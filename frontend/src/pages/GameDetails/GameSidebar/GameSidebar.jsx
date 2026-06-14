import buildStars from "../../../utils/buildStars";
import useWishlist from "../../../hooks/useWishlist";
import "./GameSidebar.css";

// ─────────────────────────────────────────────
// GameSidebar — the right column of the game
// details page. Contains the cover image, a
// short description, genre and tag pills,
// action buttons, and a metadata table.
// ─────────────────────────────────────────────


// How many tags to show before collapsing the rest into a "+ N More" badge.
// Matches the mockup which displays 6 tags then a count.
const MAX_VISIBLE_TAGS = 6;


// ── GameSidebar ──────────────────────────────

function GameSidebar({ game }) {

  const { addGame, removeGame, isWishlisted } = useWishlist();

  function handleWishlistClick() {
    isWishlisted(game.rawg_id) ? removeGame(game.rawg_id) : addGame(game);
  }

  // ── Tag slicing ───────────────────────────
  // Only the first MAX_VISIBLE_TAGS tags are shown as pills.
  // If there are more, the leftover count is shown as a "+ N More" badge.
  //
  // Example: a game with 9 tags → visibleTags has the first 6,
  // extraTagCount = 3, and the badge reads "+ 3 More".
  const visibleTags   = game.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = game.tags.length - MAX_VISIBLE_TAGS;


  // ── Render ───────────────────────────────────

  return (
    <div className="game-sidebar">

      {/* Cover image */}
      <img
        className="game-sidebar__cover"
        src={game.image}
        alt={game.name}
      />

      {/* Short description */}
      {game.description && (
        <p className="game-sidebar__description">{game.description}</p>
      )}

      <hr className="game-sidebar__divider" />

      {/* Genre pills */}
      {game.genres.length > 0 && (
        <div className="game-sidebar__pill-group">
          <span className="game-sidebar__pill-label">Genres</span>
          <div className="game-sidebar__pills">
            {game.genres.map((genre) => (
              <span key={genre} className="game-sidebar__pill">{genre}</span>
            ))}
          </div>
        </div>
      )}

      {/* Tag pills — first MAX_VISIBLE_TAGS shown, extras collapsed */}
      {game.tags.length > 0 && (
        <div className="game-sidebar__pill-group">
          <span className="game-sidebar__pill-label">Tags</span>
          <div className="game-sidebar__pills">

            {visibleTags.map((tag) => (
              <span key={tag} className="game-sidebar__pill">{tag}</span>
            ))}

            {extraTagCount > 0 && (
              <span className="game-sidebar__pill game-sidebar__pill--more">
                + {extraTagCount} More
              </span>
            )}

          </div>
        </div>
      )}


      <hr className="game-sidebar__divider" />

      {/* Action buttons */}
      <div className="game-sidebar__actions">

        <button
          className={`game-sidebar__action-btn${isWishlisted(game.rawg_id) ? " is-active" : ""}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted(game.rawg_id) ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span className="game-sidebar__action-icon">&#128278;</span>
          {isWishlisted(game.rawg_id) ? "Wishlisted" : "Wishlist"}
        </button>

      </div>


      <hr className="game-sidebar__divider" />


      {/* Metadata table */}
      <div className="game-sidebar__metadata">

        <div className="game-sidebar__meta-row">
          <span className="game-sidebar__meta-label">Developer</span>
          <span className="game-sidebar__meta-value">{game.studio}</span>
        </div>

        {game.publisher && (
          <div className="game-sidebar__meta-row">
            <span className="game-sidebar__meta-label">Publisher</span>
            <span className="game-sidebar__meta-value">{game.publisher}</span>
          </div>
        )}

        {game.release_date && (
          <div className="game-sidebar__meta-row">
            <span className="game-sidebar__meta-label">Release Date</span>
            <span className="game-sidebar__meta-value">{game.release_date}</span>
          </div>
        )}

        <div className="game-sidebar__meta-row">
          <span className="game-sidebar__meta-label">Rating</span>
          <span className="game-sidebar__meta-value game-sidebar__meta-value--rating">
            <span className="game-sidebar__stars">{buildStars(game.rating)}</span>
            {(game.rating / 2).toFixed(1)}
          </span>
        </div>

      </div>

    </div>
  );
}

export default GameSidebar;
