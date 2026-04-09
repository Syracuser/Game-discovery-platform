import "./GameCard.css";

function GameCard({ game }) {
  return (
    <div className="game-card">
      <img
        className="game-card__image"
        src={game.image}
        alt={game.name}
      />
      <div className="game-card__info">
        <p className="game-card__studio">{game.studio}</p>
        <h3 className="game-card__title">{game.name}</h3>
        <p className="game-card__price">${game.price}</p>
      </div>
    </div>
  );
}

export default GameCard;
