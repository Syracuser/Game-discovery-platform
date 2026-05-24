import { Link } from "react-router-dom";
import "./BasedOnSection.css";

const MAX_VISIBLE_CHIPS = 4;

function BasedOnSection({ selectedGenres, selectedTags }) {
  const allChips = [...selectedGenres, ...selectedTags];
  const visibleChips = allChips.slice(0, MAX_VISIBLE_CHIPS);
  const extraCount = allChips.length - MAX_VISIBLE_CHIPS;

  return (
    <div className="based-on">
      <span className="based-on__label">Based on</span>

      <div className="based-on__chips">
        {visibleChips.map((chip) => (
          <span key={chip} className="based-on__chip">
            {chip}
          </span>
        ))}
        {extraCount > 0 && (
          <span className="based-on__chip based-on__chip--more">
            +{extraCount} more
          </span>
        )}
      </div>

      <Link to="/preferences" className="based-on__edit-link">
        ✎ Edit preferences
      </Link>
    </div>
  );
}

export default BasedOnSection;
