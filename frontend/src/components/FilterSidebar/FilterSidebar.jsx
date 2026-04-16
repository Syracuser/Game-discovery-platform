import FilterSection from "../FilterSection/FilterSection";
import ScrollArea from "../ScrollArea/ScrollArea";
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

        {/* ScrollArea replaces the native sidebar scrollbar with a custom one.
            height="100%" makes it fill the full sidebar height. */}
        <ScrollArea height="100%">
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
        </ScrollArea>

      </div>
    </aside>
  );
}

export default FilterSidebar;
