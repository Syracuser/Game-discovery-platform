import EmptyState from "./EmptyState/EmptyState";
import "./Wishlist.css";

function Wishlist() {
  return (
    <div className="wishlist-page">
      <div className="wishlist-page__inner">

        <header className="wishlist-page__header">
          <h1 className="wishlist-page__title">
            Your <span className="wishlist-page__title-accent">Wishlist</span>
          </h1>
          <p className="wishlist-page__subtitle">
            <span className="wishlist-page__count">0 Wishlisted</span>
            Keep track of games you want to play later
          </p>
        </header>

        <EmptyState />

      </div>
    </div>
  );
}

export default Wishlist;
