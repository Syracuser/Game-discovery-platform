import "./Spinner.css";

// ─────────────────────────────────────────────
// Spinner — the app's single loading spinner.
// Centers itself on screen. Use it anywhere a page is loading:
//   if (loading) return <Spinner />;
// Replaces the per-page spinner markup that was duplicated across pages.
// ─────────────────────────────────────────────

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner" />
    </div>
  );
}

export default Spinner;
