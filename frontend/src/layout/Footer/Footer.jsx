import { Link } from "react-router-dom";
import { IoGameControllerOutline } from "react-icons/io5";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
            {/* LINES 9-10 IRRELEVANT FOR NOW */}
      {/* Thin accent gradient line across the top */}
      {/* <div className="footer__accent-line" /> */}

      <div className="footer__content">

        {/* Left: logo + brand name + subtitle */}
        <div className="footer__left">
          <div className="footer__logo-box">
            <IoGameControllerOutline className="footer__logo-icon" />
          </div>

          <div className="footer__brand">
            <span className="footer__brand-name">
              Game<span className="footer__brand-accent">Sense</span>
            </span>
            <span className="footer__subtitle">Find your next favorite game.</span>
          </div>
        </div>

        {/* Center: navigation links */}
        <div className="footer__center">
          <span className="footer__nav-label">Navigation</span>
          <div className="footer__nav-links">
            <Link to="/" className="footer__nav-link">Home</Link>
            <Link to="/preferences" className="footer__nav-link">Preferences</Link>
            <Link to="/wishlist" className="footer__nav-link">Wishlist</Link>
          </div>
        </div>

        {/* Right: attribution info */}
        <div className="footer__right">
          <span>Powered by <strong className="footer__rawg">RAWG API</strong></span>
          <span>Version 1.0</span>
          <span>© 2026</span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
