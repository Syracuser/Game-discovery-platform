import { Link, NavLink } from "react-router-dom";
import { FaMagnifyingGlass } from "react-icons/fa6";
import Logo from "../../components/Logo/Logo";
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
          <Logo className="navbar-logo-img" />
          <span>Game<span className="navbar-logo-accent">Sense</span></span>
        </Link>
      </div>

      {/* Middle section: Search bar */}
      <form className="navbar-search-wrapper" onSubmit={onSearchSubmit}>
        {/* Clickable search button — type="submit" so it triggers the SAME
            onSearchSubmit as pressing Enter (an additional way to search, not a
            replacement). Has the app's accent-red background. */}
        <button type="submit" className="navbar-search-btn" aria-label="Search">
          <FaMagnifyingGlass className="navbar-search-icon" />
        </button>
        <input
          type="text"
          className="navbar-search"
          placeholder="Search games..."
          value={searchInputValue}
          onChange={(e) => setSearchInputValue(e.target.value)}
        />
      </form>

      {/* Right section: Navigation links.
          NavLink auto-adds an "active" class when its route matches the current URL,
          so the current page's link is highlighted (red text + underline) via CSS. */}
      <div className="navbar-links">
        <NavLink to="/" className="navbar-link">Home</NavLink>
        <NavLink to="/preferences" className="navbar-link">Preferences</NavLink>
        <NavLink to="/wishlist" className="navbar-link">Wishlist</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
