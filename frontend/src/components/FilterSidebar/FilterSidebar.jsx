import FilterSection from "../FilterSection/FilterSection";
import "./FilterSidebar.css";

// The sidebar that contains all filter sections (Genre and Studio).
// It slides in/out based on the "isOpen" prop.
function FilterSidebar({
  isOpen,
  genres,
  studios,
  selectedGenres,
  selectedStudios,
  onToggleGenre,
  onToggleStudio,
}) {
  return (
    <aside className={`filter-sidebar ${isOpen ? "filter-sidebar--open" : ""}`}>
      {/* Inner wrapper keeps content at a fixed 240px so it doesn't
          compress while the outer shell animates its width */}
      <div className="filter-sidebar__inner">
        <h2 className="filter-sidebar__title">Filters</h2>

        <FilterSection
          title="Genre"
          options={genres}
          selectedOptions={selectedGenres}
          onToggleOption={onToggleGenre}
        />

        <FilterSection
          title="Studio"
          options={studios}
          selectedOptions={selectedStudios}
          onToggleOption={onToggleStudio}
        />
      </div>
    </aside>
  );
}

export default FilterSidebar;
