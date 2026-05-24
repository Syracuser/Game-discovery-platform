import { Link } from "react-router-dom";
import "./EmptyState.css";

function EmptyState() {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">✦</span>
      <h2 className="empty-state__title">No recommendations found.</h2>
      <p className="empty-state__subtitle">
        Narrow down your preferences and try again.
        <br />
        <Link to="/preferences" className="empty-state__link">
          Go to Preferences →
        </Link>
      </p>
    </div>
  );
}

export default EmptyState;
