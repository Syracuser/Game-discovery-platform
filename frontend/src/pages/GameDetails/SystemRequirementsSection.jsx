import "./SystemRequirementsSection.css";

// ─────────────────────────────────────────────
// SystemRequirementsSection — renders the
// Minimum and Recommended specs side by side.
//
// The data comes in as a structured dict:
//   { minimum: { OS: "...", Processor: "...", ... },
//     recommended: { OS: "...", ... } }
//
// Missing fields are silently skipped — the
// component never crashes on incomplete data.
// ─────────────────────────────────────────────


// The order that fields appear in each column.
// Any field missing from the data is simply skipped.
const FIELDS = ["OS", "Processor", "Memory", "Graphics", "DirectX", "Storage"];


// ── RequirementsColumn ───────────────────────
// A single column (either Minimum or Recommended).
// Receives a title string and a data object, then
// renders one labelled row for each known field.

function RequirementsColumn({ title, data }) {
  return (
    <div className="sys-req-column">

      <h3 className="sys-req-column__title">{title}</h3>

      {FIELDS.map((field) => {
        const value = data[field];

        // Skip the row entirely if this field wasn't provided in the data
        if (!value) return null;

        // Render the field label (e.g. "OS:") and its value side by side
        return (
          <div key={field} className="sys-req-column__row">
            <span className="sys-req-column__label">{field}:</span>
            <span className="sys-req-column__value">{value}</span>
          </div>
        );
      })}

    </div>
  );
}


// ── SystemRequirementsSection ────────────────
// The full section that renders both columns.
// Returns nothing if the game has no system requirements at all.

function SystemRequirementsSection({ systemRequirements }) {

  // If the field is missing or empty, don't render the section
  if (!systemRequirements || Object.keys(systemRequirements).length === 0) {
    return null;
  }

  // Safely unpack both keys — default to empty objects if either is missing
  const { minimum = {}, recommended = {} } = systemRequirements;

  return (
    <section className="system-requirements-section">

      <h2 className="system-requirements-section__heading">System Requirements</h2>

      <div className="system-requirements-section__columns">
        <RequirementsColumn title="Minimum:" data={minimum} />
        <RequirementsColumn title="Recommended:" data={recommended} />
      </div>

    </section>
  );
}

export default SystemRequirementsSection;
