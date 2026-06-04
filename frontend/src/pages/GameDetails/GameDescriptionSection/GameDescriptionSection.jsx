import "./GameDescriptionSection.css";

function GameDescriptionSection({ description }) {
  if (!description) return null;

  return (
    <section className="game-description-section">
      <h2 className="game-description-section__heading">About This Game</h2>
      <p className="game-description-section__text">{description}</p>
    </section>
  );
}

export default GameDescriptionSection;
