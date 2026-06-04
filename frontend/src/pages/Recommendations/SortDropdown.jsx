import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { IoCheckmark } from "react-icons/io5";
import "./SortDropdown.css";

const SORT_OPTIONS = [
  { value: "match",   label: "Match %" },
  { value: "rating",  label: "User Rating" },
  { value: "release", label: "Release: Newest" },
  { value: "price",   label: "Price: Low → High" },
];

// Controlled custom dropdown — parent owns the sort state.

// Default state set to: "match"
function SortDropdown({ value, onChange }) {

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close the menu when the user clicks anywhere outside this component
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

// Loops through each option, and returns the label of the option who's value matched the 'value' state passed as a prop
  const activeLabel = SORT_OPTIONS.find((opt) => opt.value === value)?.label;

  // Sets the passed in 'value' prop to be the newly selected option, and closes the dropdown
  function handleSelect(optValue) {
    onChange(optValue);
    setIsOpen(false);
  }

  return (
    <div className={`sort-dropdown ${isOpen ? "sort-dropdown--open" : ""}`} ref={containerRef}>

      {/* Trigger button */}
      <button
        className="sort-dropdown__btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="sort-dropdown__btn-label">{activeLabel}</span>
        {/* Chevron — rotates when menu is open via CSS */}
        <FaChevronDown className="sort-dropdown__chevron" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <ul className="sort-dropdown__menu" role="listbox">
          {SORT_OPTIONS.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isActive}
                className={`sort-dropdown__option ${isActive ? "sort-dropdown__option--active" : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                {/* Checkmark — only visible on the active option */}
                <IoCheckmark className="sort-dropdown__check" />
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}

export default SortDropdown;
