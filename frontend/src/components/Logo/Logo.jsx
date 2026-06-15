import logoImage from "../../assets/logo.png";
import "./Logo.css";

// ─────────────────────────────────────────────
// Logo — the app's compass logo image.
// Just the image (no text). Drop it anywhere you need the brand mark:
//   <Logo />
//
// Optional props let you reuse the same component at different sizes /
// with extra styling, without editing this file:
//   className — extra CSS class(es) to add on top of the base "logo" class
//   ...rest   — any other img attributes (e.g. onClick) pass straight through
// ─────────────────────────────────────────────

function Logo({ className = "", ...rest }) {
  return (
    <img
      src={logoImage}
      alt="GameSense logo"
      className={`logo ${className}`}
      {...rest}
    />
  );
}

export default Logo;
