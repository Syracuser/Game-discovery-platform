import { useState } from "react";
import ScrollArea from "../ScrollArea/ScrollArea";
import "./FilterSection.css";

// A reusable accordion section that shows a title and a list of checkboxes.
// Used for both "Genre" and "Studio" filters in the sidebar.
function FilterSection({ title, options, selectedOptions, onToggleOption, singleSelect = false, onClearOption }) {

  // Controls whether this section is expanded or collapsed (starts open)
  const [isOpen, setIsOpen] = useState(true);

  const arrowClass     = `filter-section__arrow ${isOpen ? "filter-section__arrow--open" : ""}`;
  const wrapperClass   = `filter-section__body-wrapper ${isOpen ? "filter-section__body-wrapper--open" : ""}`;


  return (
    <div className="filter-section">
      {/* Header — clicking it toggles the section open/closed */}
      <button
        className="filter-section__header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filter-section__title">{title}</span>
        
        <div className="filter-section__header-right">
          {/* Clear button — only shown in single-select mode when a studio is selected */}
          {singleSelect && selectedOptions && (
            <span
              className="filter-section__clear"
              onClick={(e) => { e.stopPropagation(); onClearOption(); }}
            >
              Clear
            </span>
          )}
          <span className={arrowClass}>▸</span>
        </div>
      </button>

      {/* Outer wrapper — animates the open/close (max-height transition) */}
      <div className={wrapperClass}>

        {/* ScrollArea replaces the native scrollbar with a custom one.
            contentClassName passes the layout styles to the inner scrollable div. */}
        <ScrollArea maxHeight="250px" contentClassName="filter-section__body">
          {options.map((option) => (
            <label key={option} className="filter-section__option">

              {/* Custom checkbox (span instead of label to avoid nested labels) */}
              <span className="filter-section__checkbox">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => onToggleOption(option)}
                />
                <div className="filter-section__checkmark"></div>
              </span>

              <span>{option}</span>
            </label>
          ))}
        </ScrollArea>

      </div>

    </div>
  );
}

export default FilterSection;
