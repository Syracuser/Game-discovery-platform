import { useState } from "react";
import { Link } from "react-router-dom";
import "./BasedOnSection.css";

const MAX_VISIBLE_CHIPS = 4;

function BasedOnSection({ selectedGenres, selectedTags }) {
  const [expanded, setExpanded] = useState(false);

  const allChips = [...selectedGenres, ...selectedTags];
  const visibleChips = allChips.slice(0, MAX_VISIBLE_CHIPS);
  const extraChips = allChips.slice(MAX_VISIBLE_CHIPS);
  const hasExtra = extraChips.length > 0;

  return (
    <div className="based-on">
      <span className="based-on__label">Based on</span>

      <div className="based-on__chips">
        {/* Always-visible chips */}
        {visibleChips.map((chip) => (
          <span key={chip} className="based-on__chip">
            {chip}
          </span>
        ))}

        {/* Extra chips — only rendered when expanded, animate in */}
        {expanded &&
          extraChips.map((chip, i) => (
            <span
              key={chip}
              className="based-on__chip based-on__chip--extra"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {chip}
            </span>
          ))}

        {/* Toggle pill */}
        {hasExtra && (
          <button
            className="based-on__chip based-on__chip--toggle"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? "Show less" : `+${extraChips.length} more`}
          </button>
        )}
      </div>

      <Link to="/preferences" className="based-on__edit-link">
        ✎ Edit preferences
      </Link>
    </div>
  );
}

export default BasedOnSection;
