import { useState } from "react";
import "./FilterSection.css";

// A reusable accordion section that shows a title and a list of checkboxes.
// Used for both "Genre" and "Studio" filters in the sidebar.
function FilterSection({ title, options, selectedOptions, onToggleOption }) {
  // Controls whether this section is expanded or collapsed (starts open)
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="filter-section">
      {/* Clicking the header toggles the section open/closed */}
      <button
        className="filter-section__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filter-section__title">{title}</span>
        <span
          className={`filter-section__arrow ${isOpen ? "filter-section__arrow--open" : ""}`}
        >
          ▸
        </span>
      </button>

      {/* Only show the checkboxes when the section is open */}
      {isOpen && (
        <div className="filter-section__body">
          {options.map((option) => (
            <label key={option} className="filter-section__option">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={() => onToggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterSection;
