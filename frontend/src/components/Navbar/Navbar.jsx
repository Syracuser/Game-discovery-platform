import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ searchText, setSearchText, onToggleSidebar, showFilterToggle }) {
  return (
    <nav className="navbar">
      {/* Left section: Filter toggle button (Home only) + App name */}
      <div className="navbar-left">
        <button
          className={`navbar-filter-toggle ${!showFilterToggle ? "navbar-filter-toggle--hidden" : ""}`}
          onClick={onToggleSidebar}
          tabIndex={showFilterToggle ? 0 : -1}
        >
          ☰
        </button>
        <Link to="/" className="navbar-logo">
          GameSense
        </Link>
      </div>

      {/* Middle section: Search bar */}
      <input
        type="text"
        className="navbar-search"
        placeholder="Search games..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* Right section: Navigation links */}
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/wishlist" className="navbar-link">Wishlist</Link>
      </div>
    </nav>
  );
}

export default Navbar;
