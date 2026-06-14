import { IoSparkles } from "react-icons/io5";
import { IoMdFlame } from "react-icons/io";
import { GiTrophy } from "react-icons/gi";
import HomeHero from "./HomeHero/HomeHero";
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
// endpoint and the /<key> browse route. `icon` is the component shown next to
// the title (passed to HomeSection, which renders it).
const SECTIONS = [
  { key: "trending", title: "Trending Now",  icon: IoMdFlame },
  { key: "popular",  title: "Most Popular",  icon: GiTrophy },
  { key: "new",      title: "New Releases",  icon: IoSparkles },
];

function Home() {
  const { addGame, removeGame, isWishlisted } = useWishlist();

  function handleWishlistToggle(game) {
    isWishlisted(game.rawg_id) ? removeGame(game.rawg_id) : addGame(game);
  }

  return (
    <div className="home">
      <HomeHero />
      {SECTIONS.map((section) => (
        <HomeSection
          key={section.key}
          sectionKey={section.key}
          title={section.title}
          Icon={section.icon}
          isWishlisted={isWishlisted}
          onWishlistToggle={handleWishlistToggle}
        />
      ))}
    </div>
  );
}

export default Home;
