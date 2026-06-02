import { Link } from "react-router-dom";
import "./EmptyState.css";

function EmptyState() {
  return (
    <div className="empty-stage">
      <div className="empty">
        <div className="empty__icon-wrap" aria-hidden="true">
          <span className="empty__icon">✦</span>
        </div>

        <h2 className="empty__title">
          A quiet space for the games <em>you'll get to.</em>
        </h2>

        <p className="empty__subtitle">
          Tap the heart on any game to remember it here. No accounts, no clutter — just a list of maybes.
        </p>

        <div className="empty__ctas">
          <Link to="/" className="cta cta--primary">
            Browse all games <span className="cta__arrow">→</span>
          </Link>

          <Link to="/preferences" className="cta cta--ghost">
            Get personalized picks
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
