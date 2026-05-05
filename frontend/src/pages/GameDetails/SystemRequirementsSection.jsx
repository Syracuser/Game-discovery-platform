import "./SystemRequirementsSection.css";

/*
  The order of fields to display — this controls the row sequence in the UI.
  Any field missing from the data is simply skipped.
*/
const FIELDS = ["OS", "Processor", "Memory", "Graphics", "DirectX", "Storage"];

function RequirementsColumn({ title, data }) {
  return (
    <div className="sys-req-column">
      <h3 className="sys-req-column__title">{title}</h3>
      {FIELDS.map((field) => {
        const value = data[field];

        if (!value) return null;
        
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

function SystemRequirementsSection({ systemRequirements }) {
  if (!systemRequirements || Object.keys(systemRequirements).length === 0) {
    return null;
  }

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
