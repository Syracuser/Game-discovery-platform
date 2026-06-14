import HomeSection from "./HomeSection/HomeSection";
import useWishlist from "../../hooks/useWishlist";
import "./Home.css";

// ─────────────────────────────────────────────
// Home — the landing page. Shows three LIVE RAWG sections
// (Trending / Popular / New Releases), each rendered by HomeSection.
//
// These are live fetches — the games are NOT stored. The stored DB games
// (the ML training core) are not shown here; they work behind the scenes.
// ─────────────────────────────────────────────

// The three sections to render, in display order. `key` matches the backend
// endpoint and the /<key> browse route, so one config drives everything.
const SECTIONS = [
  { key: "trending", title: "🔥 Trending Now" },
  { key: "popular",  title: "🏆 Most Popular" },
  { key: "new",      title: "✨ New Releases" },
];

function Home() {
  const { addGame, removeGame, isWishlisted } = useWishlist();

  function handleWishlistToggle(game) {
    isWishlisted(game.rawg_id) ? removeGame(game.rawg_id) : addGame(game);
  }

  return (
    <div className="home">
      {SECTIONS.map((section) => (
        <HomeSection
          key={section.key}
          sectionKey={section.key}
          title={section.title}
          isWishlisted={isWishlisted}
          onWishlistToggle={handleWishlistToggle}
        />
      ))}
    </div>
  );
}

export default Home;
