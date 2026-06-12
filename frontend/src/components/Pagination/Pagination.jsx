import "./Pagination.css";

/**
 * Pagination — a reusable, "dumb" pagination control.
 *
 * It only handles the UI and navigation: showing the current page, and Prev/Next
 * buttons. It does NOT fetch data or know where the data comes from. The parent
 * page owns the page number and the fetching, and just tells this component the
 * current state. This keeps it reusable for any paginated list.
 *
 * Props:
 *  - page:     current page number (1-based)
 *  - hasNext:  whether a next page exists (parent gets this from the API response)
 *  - onChange: (newPage) => void — called when the user clicks Prev/Next
 */
function Pagination({ page, hasNext, onChange }) {
  const isFirstPage = page <= 1;

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={isFirstPage}
      >
        ← Prev
      </button>

      <span className="pagination__page">Page {page}</span>

      <button
        className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={!hasNext}
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;
