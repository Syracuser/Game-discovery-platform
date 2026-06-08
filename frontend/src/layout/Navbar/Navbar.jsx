import { Link } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import "./Navbar.css";

function Navbar({ searchInputValue, setSearchInputValue, onSearchSubmit, isSidebarOpen, onToggleSidebar, showFilterToggle }) {
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
      <form className="navbar-search-wrapper" onSubmit={onSearchSubmit}>
        {/* Magnifying glass icon — turns red when the input is focused */}
        <FaMagnifyingGlass className="navbar-search-icon" />
        <input
          type="text"
          className="navbar-search"
          placeholder="Search games..."
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
        />
      </form>

      {/* Right section: Navigation links */}
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/preferences" className="navbar-link">Preferences</Link>
        <Link to="/wishlist" className="navbar-link">Wishlist</Link>
      </div>
    </nav>
  );
}

export default Navbar;
