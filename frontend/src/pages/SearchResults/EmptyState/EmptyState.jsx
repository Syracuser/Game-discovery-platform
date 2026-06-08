import { Link } from "react-router-dom";
import { MdSearchOff } from "react-icons/md";
import "./EmptyState.css";

function EmptyState({ query }) {
  return (
    <div className="search-empty">
      <div className="search-empty__icon-wrapper">
        <MdSearchOff className="search-empty__icon" />
      </div>

      <h2 className="search-empty__heading">No games were found</h2>

      <p className="search-empty__subtext">
        Sorry, we couldn't find any games matching "<span>{query}</span>"
      </p>

      <p className="search-empty__hint">
        Try a different search term or browse all games.
      </p>

      <Link to="/" className="search-empty__button">
        Go back Home
      </Link>
    </div>
  );
}

export default EmptyState;
