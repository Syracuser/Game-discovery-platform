import "./HomeHero.css";

// ─────────────────────────────────────────────
// HomeHero — the landing-page header above the live sections.
// A short tagline that gives the site personality and says what it's about.
// ─────────────────────────────────────────────

function HomeHero() {
  return (
    <header className="home-hero">
      <h1 className="home-hero__title">
        Life's too for <span className="home-hero__accent">bad</span> games.
        <br/> Game<span className="home-hero__accent">Sense</span> fixes that.
      </h1>
      <p className="home-hero__subtitle">
        Find the ones actually worth your time. Wishlist what you want to play,
        get AI-powered recommendations, and discover new favorites — all in one place.
      </p>
    </header>
  );
}

export default HomeHero;
