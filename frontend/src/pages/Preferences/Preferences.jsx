import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../api/config";
import PreferencesContainer from "./PreferencesContainer";
import "./Preferences.css";

// How many chips to show before the "View More" button appears.
const DEFAULT_GENRES_COUNT = 10;
const DEFAULT_TAGS_COUNT = 12;

// ─────────────────────────────────────────────────────────
// Preferences — lets the user pick their favourite genres
// and tags, then submits them to the /recommend endpoint
// to get personalised game suggestions.
// ─────────────────────────────────────────────────────────

function Preferences() {
  // ── Data fetched from the API ─────────────────────────
  const [genres, setGenres] = useState([]);
  const [tags, setTags]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // ── User's current selections ─────────────────────────
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedTags, setSelectedTags]     = useState([]);

  // ── Search inputs (one per container) ────────────────
  const [genreSearch, setGenreSearch] = useState("");
  const [tagSearch, setTagSearch]     = useState("");

  // ── Expand / collapse state (one per container) ───────
  const [genresExpanded, setGenresExpanded] = useState(false);
  const [tagsExpanded, setTagsExpanded]     = useState(false);

  // ── Submit state ──────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch genres and tags on mount ───────────────────
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [genresRes, tagsRes] = await Promise.all([
          axios.get(`${API_URL}/genres`),
          axios.get(`${API_URL}/tags`),
        ]);
        setGenres(genresRes.data);
        setTags(tagsRes.data);
      } catch (err) {
        setFetchError("Failed to load genres and tags. Is the backend running?");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // ── Toggle helpers ─────────────────────────────────────
  // Adds the item if not yet selected, removes it if already selected.
  function toggleGenre(genre) {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  // ── Submit handler ─────────────────────────────────────
  async function handleSubmit() {
    if (selectedGenres.length === 0 && selectedTags.length === 0) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/recommend`, {
        genres: selectedGenres,
        tags: selectedTags,
      });
      // Results will be used in a future task — log for now.
      console.log("Recommendations received:", response.data);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="preferences-page preferences-page--loading">
        <div className="preferences-page__spinner" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="preferences-page preferences-page--error">
        <p>{fetchError}</p>
      </div>
    );
  }

  const hasSelections = selectedGenres.length > 0 || selectedTags.length > 0;

  return (
    <div className="preferences-page">

      {/* ── Page heading ───────────────────── */}
      <div className="preferences-page__heading">
        <h1 className="preferences-page__title">Your Preferences</h1>
        <p className="preferences-page__subtitle">
          Pick the genres and tags that interest you most, then hit{" "}
          <strong>Submit Preferences</strong> to get personalised game recommendations.
        </p>
      </div>

      {/* ── Two side-by-side containers ──── */}
      <div className="preferences-page__containers">

        <PreferencesContainer
          containerTitle="Genres"
          containerItems={genres}
          selectedItems={selectedGenres}
          onToggle={toggleGenre}
          onClearAll={() => setSelectedGenres([])}
          searchValue={genreSearch}
          onSearchChange={setGenreSearch}
          defaultCount={DEFAULT_GENRES_COUNT}
          expanded={genresExpanded}
          onToggleExpand={() => setGenresExpanded((prev) => !prev)}
        />

        <PreferencesContainer
          containerTitle="Tags"
          containerItems={tags}
          selectedItems={selectedTags}
          onToggle={toggleTag}
          onClearAll={() => setSelectedTags([])}
          searchValue={tagSearch}
          onSearchChange={setTagSearch}
          defaultCount={DEFAULT_TAGS_COUNT}
          expanded={tagsExpanded}
          onToggleExpand={() => setTagsExpanded((prev) => !prev)}
        />

      </div>

      {/* ── Submit button ──────────────────── */}
      <div className="preferences-page__submit-wrapper">
        <button
          className={`preferences-page__submit-btn ${!hasSelections ? "preferences-page__submit-btn--disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!hasSelections || submitting}
        >
          {submitting ? "Finding recommendations..." : "Submit Preferences"}
        </button>
        {!hasSelections && (
          <p className="preferences-page__submit-hint">
            Select at least one genre or tag to continue.
          </p>
        )}
      </div>

    </div>
  );
}

export default Preferences;
