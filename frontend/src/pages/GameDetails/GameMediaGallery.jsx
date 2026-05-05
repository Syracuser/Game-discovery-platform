import { useState } from "react";
import "./GameMediaGallery.css";

/*
  GameMediaGallery

  Displays the main large screenshot and a strip of clickable thumbnails below it.
  Prev/Next arrow buttons let the user cycle through screenshots without touching
  the thumbnail strip.

  selectedIndex tracks which screenshot is currently shown.
  All navigation (arrows + thumbnails) just updates that one number.
*/

function GameMediaGallery({ screenshots, name }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) return null;

  function handlePrev() {
    setSelectedIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  }

  function handleNext() {
    setSelectedIndex((prev) =>
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  }

  return (
    <div className="game-media-gallery">

      {/* Main current large screenshot */}
      <div className="game-media-gallery__main">
        <img
          className="game-media-gallery__main-image"
          src={screenshots[selectedIndex]}
          alt={`${name} screenshot ${selectedIndex + 1}`}
        />

        {/* If there's more than one image/screenshot, render arrow buttons */}
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

      {/* Thumbnail strip */}
      {screenshots.length > 1 && (
        <div className="game-media-gallery__thumbnails">
          {screenshots.map((src, index) => (
            <button
              key={index}
              className={`game-media-gallery__thumb ${
                index === selectedIndex ? "game-media-gallery__thumb--active" : ""
              }`}
              onClick={() => setSelectedIndex(index)}
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
