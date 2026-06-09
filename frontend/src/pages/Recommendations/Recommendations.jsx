import { useState } from "react";
import { useLocation } from "react-router-dom";
import BasedOnSection from "./BasedOnSection/BasedOnSection";
import RecommendationCard from "./RecommendationCard/RecommendationCard";
import SortDropdown from "./SortDropdown/SortDropdown";
import EmptyState from "./EmptyState/EmptyState";
import "./Recommendations.css";

// ─────────────────────────────────────────────────────────────────
// Recommendations — displays ranked game suggestions based on the
// preferences the user submitted on the Preferences page.
//
// Data arrives via React Router's location state:
//   { results, selectedGenres, selectedTags }
//
// If the user lands here directly (bookmark / page refresh), state
// is null and the empty state is shown gracefully.
// ─────────────────────────────────────────────────────────────────

// Function that returns a sorted list of games.
// (List of games sorted by: match/rating/release-date)
function getSortedResults(results, sortBy) {
  const copy = [...results]; // never mutate location state
  if (sortBy === "match")   return copy.sort((a, b) => b.match_score - a.match_score);
  if (sortBy === "rating")  return copy.sort((a, b) => b.rating - a.rating);
  if (sortBy === "release") return copy.sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
    const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
    return dateB - dateA; // newest first
  });
  return copy;
}

function Recommendations() {
  // Reads 'state' object/data from Preferences.jsx 
  const location = useLocation();

  // Grabs the ranked games, picked genres, and picked tags.
  // assigns default values of empty lists if the user didn't arrive through the preferences page
  const {
    results = [],
    selectedGenres = [],
    selectedTags = [],
  } = location.state ?? {};

  const [sortBy, setSortBy] = useState("match");

  // Return a sorted list of games by Match %
  const sortedResults = getSortedResults(results, sortBy);
  const hasPreferences = selectedGenres.length > 0 || selectedTags.length > 0;

  return (
    <div className="recommendations-page">
      <div className="recommendations-page__inner">

        {/* "BASED ON" preference chips — only if preferences exist */}
        {hasPreferences && (
          <BasedOnSection
            selectedGenres={selectedGenres}
            selectedTags={selectedTags}
          />
        )}

        {/* ── Page header ─────────────────────────────── */}
        <div className="recommendations-page__header">
          <h1 className="recommendations-page__title">
            Recommended{" "}
            <span className="recommendations-page__title-accent">For You</span>
          </h1>

          <p className="recommendations-page__subtitle">
            <span className="recommendations-page__subtitle-icon">✦</span>
            {results.length} game{results.length !== 1 ? "s" : ""} matched to your taste
            {" · "}Based on your selected preferences
          </p>
        </div>

        {/* ── Controls row — hidden when there are no results ── */}
        {sortedResults.length > 0 && (
          <div className="recommendations-page__controls">
            <div className="recommendations-page__count-row">
              <span className="recommendations-page__count-label">
                All recommendations:
              </span>
              <span className="recommendations-page__count-pill">
                {results.length} games
              </span>
            </div>
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        )}

        {/* ── Game cards or empty state ─────────────────── */}
        {sortedResults.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="recommendations-page__list">
            {sortedResults.map((game, index) => (
              <RecommendationCard
                key={game._id}
                game={game}
                rank={index + 1}
                selectedGenres={selectedGenres}
                selectedTags={selectedTags}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Recommendations;
