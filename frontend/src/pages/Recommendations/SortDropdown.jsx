import "./SortDropdown.css";

const SORT_OPTIONS = [
  { value: "match",   label: "Match %" },
  { value: "price",   label: "Price: Low → High" },
  { value: "rating",  label: "Rating" },
  { value: "release", label: "Release: Newest" },
];

// Controlled dropdown — parent owns the sort state.
function SortDropdown({ value, onChange }) {
  return (
    <div className="sort-dropdown">
      <label className="sort-dropdown__label" htmlFor="sort-select">
        Sort by
      </label>
      <div className="sort-dropdown__wrapper">
        <select
          id="sort-select"
          className="sort-dropdown__select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="sort-dropdown__arrow">▾</span>
      </div>
    </div>
  );
}

export default SortDropdown;
