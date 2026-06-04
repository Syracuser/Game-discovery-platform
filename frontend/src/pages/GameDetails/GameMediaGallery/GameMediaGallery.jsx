import { useState } from "react";
import "./GameMediaGallery.css";

// ─────────────────────────────────────────────
// GameMediaGallery — the screenshot gallery.
// Shows one large screenshot at a time, with
// left/right arrows to cycle through them and
// a thumbnail strip below to jump to any one directly.
// ─────────────────────────────────────────────

function GameMediaGallery({ screenshots, name }) {

  // ── State ────────────────────────────────────
  // Tracks the position of the screenshot currently on screen.
  // 0 = first screenshot, 1 = second, and so on.
  const [currentScreenshot, setCurrentScreenshot] = useState(0);


  // ── Guard ────────────────────────────────────
  // If no screenshots were provided, render nothing at all.

  if (!screenshots || screenshots.length === 0) return null;


  // ── Navigation handlers ───────────────────────
  // Both wrap around — prev on the first goes to the last, and vice versa.

  function handlePrev() {
    setCurrentScreenshot((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  }

  function handleNext() {
    setCurrentScreenshot((prev) =>
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  }


  // ── Render ───────────────────────────────────

  return (
    <div className="game-media-gallery">

      {/* Main large screenshot — shows whichever screenshot currentScreenshot points to */}
      <div className="game-media-gallery__main">

        <img
          className="game-media-gallery__main-image"
          src={screenshots[currentScreenshot]}
          alt={`${name} screenshot ${currentScreenshot + 1}`}
        />

        {/* Only show arrows if there is more than one screenshot to cycle through */}
        {screenshots.length > 1 && (
          <>
            <button
              className="game-media-gallery__arrow game-media-gallery__arrow--left"
              onClick={handlePrev}
              aria-label="Previous screenshot"
            >
              ‹
            </button>

            <button
              className="game-media-gallery__arrow game-media-gallery__arrow--right"
              onClick={handleNext}
              aria-label="Next screenshot"
            >
              ›
            </button>
          </>
        )}

      </div>

      {/* Thumbnail strip — the row of small preview images below the main one.
          Clicking a thumbnail jumps directly to that screenshot. */}
      {screenshots.length > 1 && (

        <div className="game-media-gallery__thumbnails">
          {screenshots.map((src, index) => (
            <button
              key={index}
              className={`game-media-gallery__thumb ${
                index === currentScreenshot ? "game-media-gallery__thumb--active" : ""
              }`}
              onClick={() => setCurrentScreenshot(index)}
              aria-label={`View screenshot ${index + 1}`}
            >
              <img src={src} alt={`${name} thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
        
      )}

    </div>
  );
}

export default GameMediaGallery;
