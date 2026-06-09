import { Link } from "react-router-dom";
import useWishlist from "../../hooks/useWishlist";
import GameCard from "../../components/GameCard/GameCard";
import EmptyState from "./EmptyState/EmptyState";
import "./Wishlist.css";

function Wishlist() {
  const { wishlist, addGame, removeGame, isWishlisted } = useWishlist();

  function handleWishlistToggle(game) {
    isWishlisted(game._id) ? removeGame(game._id) : addGame(game);
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-page__inner">

        <header className="wishlist-page__header">
          <h1 className="wishlist-page__title">
            Your <span className="wishlist-page__title-accent">Wishlist</span>
          </h1>
          <p className="wishlist-page__subtitle">
            <span className="wishlist-page__count">{wishlist.length} Wishlisted</span>
            Keep track of games you want to play later
          </p>
        </header>

        {wishlist.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="home__games-grid">
            {wishlist.map((game) => (
              <Link to={`/games/${game._id}`} key={game._id} className="game-link">
                <GameCard
                  game={game}
                  isWishlisted={true}
                  onWishlistToggle={handleWishlistToggle}
                />
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Wishlist;
