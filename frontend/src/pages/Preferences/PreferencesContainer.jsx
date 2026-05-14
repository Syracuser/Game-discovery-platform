import "./PreferencesContainer.css";

// ─────────────────────────────────────────────────────
// PreferencesContainer — reusable selection box used
// for both Genres and Tags on the Preferences page.
//
// It shows:
//   1. A header with the container title and an optional
//      "Clear All" button (only when items are selected).
//   2. A live search input that filters available chips.
//   3. A "Selected" section pinned at the top showing
//      all currently selected chips.
//   4. An available chips section that shows a limited
//      number of chips by default, expandable via
//      "View More / View Less".
// ─────────────────────────────────────────────────────

function PreferencesContainer({
  containerTitle,
  containerItems,
  selectedItems,
  onToggle,
  onClearAll,
  searchValue,
  onSearchChange,
  defaultCount,
  expanded,
  onToggleExpand,
}) {
  const lowerSearch = searchValue.toLowerCase();

  // All unselected items that match the current search query.
  // Selected items are excluded here — they live in the Selected section above.
  const filteredUnselected = containerItems
    .filter((item) => !selectedItems.includes(item))
    .filter((item) => item.toLowerCase().includes(lowerSearch));

  // In collapsed state, only show the first `defaultCount` chips.
  // In expanded state, show everything.
  const visibleUnselected = expanded
    ? filteredUnselected
    : filteredUnselected.slice(0, defaultCount);

  const totalUnselected = containerItems.filter((item) => !selectedItems.includes(item)).length;

  return (
    <div className="pref-container">

      {/* ── Header ───────────────────────────── */}
      <div className="pref-container__header">
        <div className="pref-container__title-group">
          <h2 className="pref-container__title">{containerTitle}</h2>
          {selectedItems.length > 0 && (
            <span className="pref-container__count-badge" key={selectedItems.length}>
              {selectedItems.length}
            </span>
          )}
        </div>
        {selectedItems.length > 0 && (
          <button className="pref-container__clear-all" onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      {/* ── Search Input ─────────────────────── */}
      <div className="pref-container__search-wrapper">
        <svg className="pref-container__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="pref-container__search"
          placeholder={`Search ${containerTitle.toLowerCase()}…`}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchValue && (
          <button
            type="button"
            className="pref-container__search-clear"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
          >
            ×
          </button>
        )}
      </div>

      {/* ── Your Picks section ───────────────── */}
      {/* Always visible when something is selected, regardless of search. */}
      {selectedItems.length > 0 && (
        <div className="pref-container__picks-box">
          <span className="pref-container__picks-label">Your Picks</span>
          <div className="pref-container__chips pref-container__chips--picks">
            {selectedItems.map((item) => (
              <button
                key={item}
                className="pref-container__chip pref-container__chip--selected"
                onClick={() => onToggle(item)}
                title="Click to deselect"
              >
                {item}
                <span className="pref-container__chip-x">✕</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Available Chips ───────────────────── */}
      <div
        className={`pref-container__options-wrapper ${
          expanded ? "pref-container__options-wrapper--expanded" : ""
        }`}
      >
        <div className="pref-container__chips">
          {visibleUnselected.length > 0 ? (
            visibleUnselected.map((item) => (
              <button
                key={item}
                className="pref-container__chip"
                onClick={() => onToggle(item)}
              >
                {item}
              </button>
            ))
          ) : (
              // Show a subtle message when search finds nothing
            searchValue && (
              <span className="pref-container__no-results">
                No {containerTitle.toLowerCase()} match "{searchValue}"
              </span>
            )
          )}
        </div>
      </div>

      {/* ── Footer: availability counter + View more/less ── */}
      <div className="pref-container__footer">
        <span className="pref-container__available-count">
          {expanded
            ? `Showing all ${containerItems.length}`
            : `+${Math.max(0, totalUnselected - defaultCount)} more available`}
        </span>
        <button className="pref-container__view-more" onClick={onToggleExpand}>
          {expanded ? "View less" : "View more"}
          <span className={`pref-container__view-more__arrow${expanded ? " pref-container__view-more__arrow--open" : ""}`}>
            ▾
          </span>
        </button>
      </div>

    </div>
  );
}

export default PreferencesContainer;
