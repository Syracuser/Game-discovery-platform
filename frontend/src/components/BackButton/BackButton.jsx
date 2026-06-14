import { useNavigate } from "react-router-dom";
import "./BackButton.css";

// ─────────────────────────────────────────────
// BackButton — a reusable "← Back" button.
//
// navigate(-1) goes back one step in history (like the browser back button), so
// it returns the user to whatever page they came from. If there's no history to
// go back to (e.g. the user opened this page from a direct/shared link), we fall
// back to Home so the button never leads nowhere.
// ─────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate();

  function handleBack() {
    // window.history.length <= 1 means there's no previous in-app page to return to.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <button className="back-button" onClick={handleBack} aria-label="Go back">
      ← Back
    </button>
  );
}

export default BackButton;
