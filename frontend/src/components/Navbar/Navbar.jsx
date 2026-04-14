import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ searchText, setSearchText, isSidebarOpen, onToggleSidebar, showFilterToggle }) {
  return (
    <nav className="navbar">
      {/* Left section: Filter toggle button (Home only) + App name */}
      <div className="navbar-left">
        <label
          className={`navbar-burger ${!showFilterToggle ? "navbar-burger--hidden" : ""}`}
          htmlFor="navbar-burger"
          tabIndex={showFilterToggle ? 0 : -1}
        >
          <input
            type="checkbox"
            id="navbar-burger"
            checked={isSidebarOpen}
            onChange={onToggleSidebar}
          />
          <span></span>
          <span></span>
          <span></span>
        </label>
        <Link to="/" className="navbar-logo">
          GameSense
        </Link>
      </div>

      {/* Middle section: Search bar */}
      <div className="navbar-search-wrapper">
        {/* Magnifying glass icon — turns red when the input is focused */}
        <svg className="navbar-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="navbar-search"
          placeholder="Search games..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Right section: Navigation links */}
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/wishlist" className="navbar-link">Wishlist</Link>
      </div>
    </nav>
  );
}

export default Navbar;
