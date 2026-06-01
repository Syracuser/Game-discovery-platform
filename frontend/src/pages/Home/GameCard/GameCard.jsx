import { useState } from "react";
import PLATFORM_ICONS from "../../../utils/platformIcons";
import "./GameCard.css";

function GameCard({ game }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [popAnim, setPopAnim] = useState(false);

  function handleWishlistClick(e) {
    // Stop the click from bubbling up to the <Link> wrapper
    e.preventDefault();
    e.stopPropagation();

    setWishlisted((prev) => !prev);

    // Trigger the pop animation briefly
    setPopAnim(true);
    setTimeout(() => setPopAnim(false), 320);
  }

  const wishClass = [
    "gc__wish",
    wishlisted ? "is-on" : "",
    popAnim ? "is-pop" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="gc">

      {/* ── Poster / Image area ── */}
      <div className="gc__poster">
        <img className="gc__img" src={game.image} alt={game.name} />

        {/* Gradient scrim for readability of overlaid elements */}
        <div className="gc__scrim" />

        {/* Rating chip — top left */}
        <div className="gc__rating">
          <svg className="gc__star" width="11" height="11" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {game.rating?.toFixed(1)}
        </div>

        {/* Wishlist button — top right */}
        <button
          className={wishClass}
          onClick={handleWishlistClick}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {/* Filled heart when wishlisted, outline heart otherwise */}
          {wishlisted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Footer / Info area ── */}
      <div className="gc__info">

        {/* Row: studio name (left) + platform icons (right) */}
        <div className="gc__topline">
          <span className="gc__studio">{game.studio}</span>
          <div className="gc__platforms">
            {game.platforms?.map((platform) => {
              const Icon = PLATFORM_ICONS[platform];
              return Icon ? <Icon key={platform} size={13} /> : null;
            })}
          </div>
        </div>

        {/* Game title */}
        <h3 className="gc__title">{game.name}</h3>

        {/* Genre chips — first 2 only */}
        <div className="gc__bottom">
          <div className="gc__tags">
            {game.genres?.slice(0, 2).map((genre) => (
              <span key={genre} className="gc__tag">{genre}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default GameCard;
