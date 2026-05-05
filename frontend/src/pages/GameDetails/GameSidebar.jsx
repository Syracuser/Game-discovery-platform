import "./GameSidebar.css";

/*
  How many tags to show before collapsing the rest into "+ N More".
  Matches the mockup which shows 6 tags then a count badge.
*/
const MAX_VISIBLE_TAGS = 6;

/*
  Converts our 10-point rating scale to a 5-star display string.
  e.g. 9.0 → "★★★★★"  |  7.5 → "★★★★☆"
*/
function buildStars(rating) {
  const filled = Math.round(rating / 2);
  const empty  = 5 - filled;
  return "★".repeat(filled) + "☆".repeat(empty);
}

function GameSidebar({ game }) {
  
  const visibleTags = game.tags.slice(0, MAX_VISIBLE_TAGS);
  const extraTagCount = game.tags.length - MAX_VISIBLE_TAGS;

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

      {/* Divider */}
      <hr className="game-sidebar__divider" />

      {/* Genres */}
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

      {/* Tags */}
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

      {/* Divider */}
      <hr className="game-sidebar__divider" />

      {/* Action buttons */}
      <div className="game-sidebar__actions">

        <button className="game-sidebar__action-btn">
          <span className="game-sidebar__action-icon">&#128077;</span>
          Like
        </button>

        <button className="game-sidebar__action-btn">
          <span className="game-sidebar__action-icon">&#10084;</span>
          Favorite
        </button>

        <button className="game-sidebar__action-btn">
          <span className="game-sidebar__action-icon">&#128278;</span>
          Watchlist
        </button>
        
      </div>

      {/* Divider */}
      <hr className="game-sidebar__divider" />

      {/* Metadata rows */}
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
        <div className="game-sidebar__meta-row">
          <span className="game-sidebar__meta-label">Price</span>
          <span className="game-sidebar__meta-value">${game.price.toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
}

export default GameSidebar;
