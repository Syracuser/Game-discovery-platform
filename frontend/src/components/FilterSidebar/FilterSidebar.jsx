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
    </aside>
  );
}

export default FilterSidebar;
