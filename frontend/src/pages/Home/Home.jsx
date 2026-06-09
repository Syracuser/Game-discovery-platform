import { useState, useEffect } from "react";
import { useOutletContext, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/config";
import FilterSidebar from "./FilterSidebar/FilterSidebar";
import GameCard from "../../components/GameCard/GameCard";
import useWishlist from "../../hooks/useWishlist";
import "./Home.css";

// ─────────────────────────────────────────────
// Home — the main games listing page.
// Owns all filter state (genres, tags, studio) and
// renders FilterSidebar as a sibling to the game grid,
// so both are direct flex children of layout__body.
// ─────────────────────────────────────────────

function Home() {

  // ── Context (from Layout) ────────────────────
  const { isSidebarOpen, setIsSidebarOpen } = useOutletContext();

  // ── Wishlist ─────────────────────────────────
  const { addGame, removeGame, isWishlisted } = useWishlist();

  function handleWishlistToggle(game) {
    isWishlisted(game._id) ? removeGame(game._id) : addGame(game);
  }


  const navigate = useNavigate();
  const location = useLocation();


  // ── Filter options (loaded from backend) ─────

  const [genres,  setGenres]  = useState([]);
  const [tags,    setTags]    = useState([]);
  const [studios, setStudios] = useState([]);


  // ── Selected filter values ───────────────────

  const [selectedGenres,  setSelectedGenres]  = useState([]);
  const [selectedTags,    setSelectedTags]    = useState([]);
  const [selectedStudio,  setSelectedStudio]  = useState("");

  // The first filter the user checked — encoded into game URLs so GameDetails
  // can show a breadcrumb back to that filtered view.
  const [firstFilter, setFirstFilter] = useState(null);


  // ── Games state ──────────────────────────────

  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);


  // ── Data fetching ────────────────────────────

  // Fetch Genres, Tags, Studios from backend
  useEffect(() => {
    axios.get(`${API_URL}/genres`)
      .then((res) => setGenres(res.data))
      .catch((err) => console.error("Failed to fetch genres:", err));

    axios.get(`${API_URL}/tags`)
      .then((res) => setTags(res.data))
      .catch((err) => console.error("Failed to fetch tags:", err));

    axios.get(`${API_URL}/studios`)
      .then((res) => setStudios(res.data))
      .catch((err) => console.error("Failed to fetch studios:", err));
  }, []);

  // Fetch Games from backend
  useEffect(() => {
    axios.get(`${API_URL}/games`)
      .then((res) => setGames(res.data))
      .catch((err) => {
        console.error("Failed to fetch games:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);


  // ── Preselect handler ────────────────────────
  // When the user clicks a filter in the breadcrumb in GameDetails, they're sent back
  // to "/" (the home page) with { preselect: { type, value } } in location.state.
  // This reads that state, applies the filter, opens the sidebar,
  // then clears the state so it doesn't re-apply on future renders.
  useEffect(() => {
    if (!location.state?.preselect) return;

    const { type, value } = location.state.preselect;

    if (type === "genre") setSelectedGenres([value]);
    if (type === "tag")   setSelectedTags([value]);

    setFirstFilter({ type, value });
    setIsSidebarOpen(true);

    navigate("/", { replace: true, state: null });
  }, [location.state]);


  // ── Filter handlers ──────────────────────────

  /**
   * Factory that produces a toggle-handler for a given state setter.
   * Also tracks the first filter checked so it can be passed to GameDetails for the breadcrumb.
   */
  function makeToggler(setState, type) {
    return (value) => {
      setState((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
      setFirstFilter((prev) => {
        const isChecked = prev?.type === type && prev?.value === value;
        if (isChecked) return null;           // unchecking the current first filter → clear it
        if (prev === null) return { type, value }; // no first filter yet → set this one
        return prev;                          // already have a first filter → keep it
      });
    };
  }

  const handleToggleGenre = makeToggler(setSelectedGenres, "genre");
  const handleToggleTag   = makeToggler(setSelectedTags, "tag");


  function handleSelectStudio(studio) {
    setSelectedStudio(studio); 
    }

  function handleClearStudio() { 
    setSelectedStudio(""); 
  }


  // ── Filtering ────────────────────────────────

  const filteredGames = games
    .filter((game) =>
    // No genres selected = show all. Otherwise game must match ALL selected genres.
      selectedGenres.length === 0 ||
      selectedGenres.every((g) => game.genres.includes(g))
    )
    .filter((game) =>
    // No tags selected = show all. Otherwise game must have ALL selected tags.
      selectedTags.length === 0 ||
      selectedTags.every((t) => game.tags.includes(t))
    )
    .filter((game) =>
    // No studio selected = show all. Otherwise game's studio must match.
      !selectedStudio || game.studio === selectedStudio
    );




  // ── Render ───────────────────────────────────

  return (
    <>
      <FilterSidebar
        isOpen={isSidebarOpen}
        genres={genres}
        tags={tags}
        studios={studios}
        selectedGenres={selectedGenres}
        selectedTags={selectedTags}
        selectedStudio={selectedStudio}
        onToggleGenre={handleToggleGenre}
        onToggleTag={handleToggleTag}
        onSelectStudio={handleSelectStudio}
        onClearStudio={handleClearStudio}
      />

      <main className="main-content">
        {loading ? (
          <div className="home__spinner-container">
            <div className="home__spinner"></div>
          </div>

        ) : error ? (
          <div className="home">
            <p className="home__error">Failed to load games. Please try again later.</p>
          </div>

        ) : (
          <div className="home">
            <h1 className="home__title">All Games</h1>

            <div className="home__games-grid">
              {filteredGames.map((game) => (
                <Link
                  to={`/games/${game._id}${firstFilter ? `?filter=${firstFilter.type}:${firstFilter.value}` : ""}`}
                  key={game._id}
                  className="game-link"
                >
                  <GameCard
                    game={game}
                    isWishlisted={isWishlisted(game._id)}
                    onWishlistToggle={handleWishlistToggle}
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
